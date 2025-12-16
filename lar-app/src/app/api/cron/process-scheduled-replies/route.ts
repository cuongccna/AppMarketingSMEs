import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { GoogleBusinessProfileClient } from '@/lib/google-business'
import { generateReviewResponse } from '@/lib/ai'

export const dynamic = 'force-dynamic' // Ensure it's not cached

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    
    // ---------------------------------------------------------
    // 1. Catch-up: Find NEW 5-star reviews that need scheduling
    // ---------------------------------------------------------
    const newReviews = await prisma.review.findMany({
      where: {
        status: 'NEW',
        rating: 5,
        sentiment: 'POSITIVE',
        responses: {
          none: {}
        }
      },
      include: {
        location: {
          include: {
            business: true
          }
        }
      },
      take: 5 // Limit to 5 to avoid timeout during generation
    })

    let scheduledCount = 0

    for (const review of newReviews) {
      try {
        const userId = review.location.business.userId
        const userSettings = await prisma.userSettings.findUnique({
          where: { userId: userId }
        })

        if (userSettings?.autoReplyFiveStar) {
           console.log(`Scheduling auto-reply for review ${review.id}...`)
           const responseResult = await generateReviewResponse({
              reviewContent: review.content || '',
              reviewerName: review.authorName,
              rating: review.rating,
              sentiment: review.sentiment as any,
              businessName: review.location.business.name,
              tone: (userSettings.defaultTone as any) || 'PROFESSIONAL',
              customInstructions: userSettings.customInstructions || undefined,
              preferredProvider: (userSettings.preferredModel as any) || 'auto',
            })

            // Schedule for NOW (since it's a catch-up)
            const scheduledAt = new Date()
            
            await prisma.response.create({
              data: {
                reviewId: review.id,
                content: responseResult.response,
                tone: (userSettings.defaultTone as any) || 'PROFESSIONAL',
                isAiGenerated: true,
                status: 'SCHEDULED',
                scheduledAt: scheduledAt,
                tokensUsed: responseResult.tokensUsed,
                modelUsed: responseResult.model,
              },
            })

            await prisma.review.update({
              where: { id: review.id },
              data: { status: 'PENDING_RESPONSE' }
            })
            
            scheduledCount++
        }
      } catch (err) {
        console.error(`Failed to schedule reply for review ${review.id}:`, err)
      }
    }

    // ---------------------------------------------------------
    // 2. Process Scheduled Responses
    // ---------------------------------------------------------
    const scheduledResponses = await prisma.response.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now,
        },
      },
      include: {
        review: {
          include: {
            location: {
              include: {
                platformConnections: {
                  where: {
                    platform: 'GOOGLE_BUSINESS_PROFILE',
                    isConnected: true,
                  },
                },
              },
            },
          },
        },
      },
      take: 20, // Process in batches to avoid timeout
    })

    let processedCount = 0
    let errorCount = 0

    if (scheduledResponses.length > 0) {
        for (const response of scheduledResponses) {
          try {
            const review = response.review
            const location = review.location
            const gbpConnection = location.platformConnections[0]

            if (!gbpConnection || !gbpConnection.accessToken) {
              console.error(`No GBP connection for location ${location.id}`)
              errorCount++
              continue
            }

            // Parse external ID (format: accountId/locationId)
            const [accountId, gbpLocationId] = gbpConnection.externalId.split('/')
            
            // Initialize GBP client
            const gbpClient = new GoogleBusinessProfileClient(gbpConnection.accessToken)

            // Send reply
            await gbpClient.replyToReview(
              accountId,
              gbpLocationId,
              review.externalId,
              response.content
            )

            // Update status
            await prisma.$transaction([
              prisma.response.update({
                where: { id: response.id },
                data: {
                  status: 'PUBLISHED',
                  publishedAt: new Date(),
                },
              }),
              prisma.review.update({
                where: { id: review.id },
                data: {
                  status: 'RESPONDED',
                },
              }),
            ])

            processedCount++
          } catch (error) {
            console.error(`Failed to process response ${response.id}:`, error)
            errorCount++
          }
        }
    }

    return NextResponse.json({
      success: true,
      scheduledNew: scheduledCount,
      processed: processedCount,
      errors: errorCount,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
