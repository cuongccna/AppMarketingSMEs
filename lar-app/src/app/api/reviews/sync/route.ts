import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { GoogleBusinessProfileClient, transformGBPReview } from '@/lib/google-business'
import { analyzeSentiment, generateReviewResponse } from '@/lib/ai'

/**
 * POST /api/reviews/sync
 * Sync reviews from Google Business Profile
 * Uses batch processing for cost optimization as per report
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { locationId } = body

    // If no locationId, sync all locations for this user
    if (!locationId) {
      // Get all locations with GBP connection
      const locations = await prisma.location.findMany({
        where: {
          business: {
            userId: (session.user as any).id,
          },
          platformConnections: {
            some: {
              platform: 'GOOGLE_BUSINESS_PROFILE',
              isConnected: true,
            },
          },
        },
        include: {
          platformConnections: {
            where: {
              platform: 'GOOGLE_BUSINESS_PROFILE',
              isConnected: true,
            },
          },
        },
      })

      if (locations.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'Chưa kết nối Google Business Profile. Vui lòng kết nối địa điểm trước.',
          synced: 0,
          newReviews: 0,
          updatedReviews: 0,
        })
      }

      // For now, just return success - full sync would be done per location
      return NextResponse.json({
        success: true,
        message: `Đã tìm thấy ${locations.length} địa điểm. Vui lòng đồng bộ từng địa điểm trong trang Địa Điểm.`,
        locations: locations.length,
        synced: 0,
      })
    }

    // Get location with platform connection
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        business: {
          userId: (session.user as any).id,
        },
      },
      include: {
        business: true,
        platformConnections: {
          where: {
            platform: 'GOOGLE_BUSINESS_PROFILE',
            isConnected: true,
          },
        },
      },
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    const gbpConnection = location.platformConnections[0]
    if (!gbpConnection || !gbpConnection.accessToken) {
      return NextResponse.json(
        { error: 'Google Business Profile not connected' },
        { status: 400 }
      )
    }

    // Initialize GBP client
    const gbpClient = new GoogleBusinessProfileClient(gbpConnection.accessToken)

    // Parse external ID (format: accountId/locationId)
    const [accountId, gbpLocationId] = gbpConnection.externalId.split('/')

    // Fetch reviews from GBP
    let allReviews: any[] = []
    let pageToken: string | undefined

    do {
      const result = await gbpClient.getReviews(accountId, gbpLocationId, 50, pageToken)
      allReviews = allReviews.concat(result.reviews)
      pageToken = result.nextPageToken
    } while (pageToken && allReviews.length < 200) // Limit for cost control

    // Get user settings for auto-reply
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: (session.user as any).id },
    })

    // Process and save reviews
    let newReviewsCount = 0
    let updatedReviewsCount = 0

    for (const gbpReview of allReviews) {
      const reviewData = transformGBPReview(gbpReview)

      // Check if review already exists
      const existingReview = await prisma.review.findUnique({
        where: {
          platform_externalId: {
            platform: 'GOOGLE_BUSINESS_PROFILE',
            externalId: reviewData.externalId,
          },
        },
      })

      let currentReviewId: string
      let currentSentiment: string

      if (existingReview) {
        currentReviewId = existingReview.id
        currentSentiment = existingReview.sentiment

        // Update if content changed
        if (existingReview.content !== reviewData.content) {
          await prisma.review.update({
            where: { id: existingReview.id },
            data: {
              content: reviewData.content,
              rating: reviewData.rating,
            },
          })
          updatedReviewsCount++
        }
      } else {
        // Analyze sentiment for new review
        const sentimentResult = await analyzeSentiment(reviewData.content || '')

        // Create new review
        const newReview = await prisma.review.create({
          data: {
            locationId: location.id,
            platform: 'GOOGLE_BUSINESS_PROFILE',
            externalId: reviewData.externalId,
            authorName: reviewData.authorName,
            authorPhotoUrl: reviewData.authorPhotoUrl,
            rating: reviewData.rating,
            content: reviewData.content,
            sentiment: sentimentResult.sentiment,
            sentimentScore: sentimentResult.score,
            keywords: sentimentResult.keywords,
            status: reviewData.hasReply ? 'RESPONDED' : 'NEW',
            publishedAt: reviewData.publishedAt,
          },
        })
        newReviewsCount++
        
        currentReviewId = newReview.id
        currentSentiment = sentimentResult.sentiment
      }

      // Auto-Reply Logic for 5-star positive reviews (Check for both new and existing reviews)
      console.log(`Checking auto-reply for review ${currentReviewId}: Rating=${reviewData.rating}, Sentiment=${currentSentiment}, HasReply=${reviewData.hasReply}, AutoReplySetting=${userSettings?.autoReplyFiveStar}`)
      
      if (
        userSettings?.autoReplyFiveStar &&
        reviewData.rating === 5 &&
        currentSentiment === 'POSITIVE' &&
        !reviewData.hasReply
      ) {
        try {
          // Check if we already have a response locally (to avoid duplicates)
          const existingResponse = await prisma.response.findFirst({
            where: { reviewId: currentReviewId },
          })

          if (!existingResponse) {
            console.log(`Generating auto-reply for review ${currentReviewId}...`)
            const responseResult = await generateReviewResponse({
              reviewContent: reviewData.content || '',
              reviewerName: reviewData.authorName,
              rating: reviewData.rating,
              sentiment: currentSentiment as any,
              businessName: location.business.name,
              tone: (userSettings.defaultTone as any) || 'PROFESSIONAL',
              customInstructions: userSettings.customInstructions || undefined,
              preferredProvider: (userSettings.preferredModel as any) || 'auto',
            })

            // Schedule for 15 minutes later
            const scheduledAt = new Date()
            scheduledAt.setMinutes(scheduledAt.getMinutes() + 15)

            await prisma.response.create({
              data: {
                reviewId: currentReviewId,
                content: responseResult.response,
                tone: (userSettings.defaultTone as any) || 'PROFESSIONAL',
                isAiGenerated: true,
                status: 'SCHEDULED',
                scheduledAt: scheduledAt,
                tokensUsed: responseResult.tokensUsed,
                modelUsed: responseResult.model,
              },
            })
            console.log(`Scheduled auto-reply for review ${currentReviewId}`)
          }
        } catch (err) {
          console.error('Auto-reply generation failed:', err)
        }
      }
    }

    // Update last sync time
    await prisma.platformConnection.update({
      where: { id: gbpConnection.id },
      data: { lastSyncAt: new Date() },
    })

    // Update usage stats
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    await prisma.usageStats.upsert({
      where: {
        userId_month: {
          userId: (session.user as any).id,
          month: currentMonth,
        },
      },
      update: {
        reviewsScanned: { increment: allReviews.length },
      },
      create: {
        userId: (session.user as any).id,
        month: currentMonth,
        reviewsScanned: allReviews.length,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Đồng bộ thành công: ${newReviewsCount} đánh giá mới, ${updatedReviewsCount} đánh giá cập nhật`,
      stats: {
        total: allReviews.length,
        new: newReviewsCount,
        updated: updatedReviewsCount,
      },
    })
  } catch (error) {
    console.error('Sync reviews error:', error)
    return NextResponse.json({ error: 'Failed to sync reviews' }, { status: 500 })
  }
}
