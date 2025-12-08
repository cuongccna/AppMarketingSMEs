import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { GoogleBusinessProfileClient, transformGBPReview } from '@/lib/google-business'
import { analyzeSentiment } from '@/lib/ai'

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

    const { locationId } = await request.json()

    if (!locationId) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 })
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

      if (existingReview) {
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
        await prisma.review.create({
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
