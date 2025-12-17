import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { GoogleBusinessProfileClient } from '@/lib/google-business'
import { generateReviewResponse } from '@/lib/ai'
import { createZaloOAClient } from '@/lib/zalo-oa'

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

            // Update Usage Stats
            const currentMonth = new Date()
            currentMonth.setDate(1)
            currentMonth.setHours(0, 0, 0, 0)

            await prisma.usageStats.upsert({
              where: {
                userId_month: {
                  userId: userId,
                  month: currentMonth,
                },
              },
              update: {
                aiResponseCount: { increment: 1 },
                tokensUsed: { increment: responseResult.tokensUsed },
              },
              create: {
                userId: userId,
                month: currentMonth,
                aiResponseCount: 1,
                tokensUsed: responseResult.tokensUsed,
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
    const errorDetails: any[] = []

    if (scheduledResponses.length > 0) {
        for (const response of scheduledResponses) {
          try {
            const review = response.review
            const location = review.location
            
            // ---------------------------------------------------------
            // Handle Platform Specific Logic
            // ---------------------------------------------------------
            if (review.platform === 'GOOGLE_BUSINESS_PROFILE') {
                const gbpConnection = location.platformConnections[0]

                if (!gbpConnection || !gbpConnection.accessToken) {
                  const connections = location.platformConnections.map((c: any) => `${c.platform} (Connected: ${c.isConnected})`).join(', ')
                  const msg = `No GBP connection for location ${location.id}. Found: ${connections || 'None'}`
                  console.error(msg)
                  errorDetails.push({ id: response.id, error: msg })
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
            } 
            // For ZALO_OA, we don't need to call an external API to "publish" the reply 
            // because the review exists within our system (or Zalo doesn't support direct API reply in the same way).
            // We just proceed to mark it as PUBLISHED.

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

            // ---------------------------------------------------------
            // 3. Send Notification to Zalo (if applicable)
            // ---------------------------------------------------------
            if (review.zaloUserId) {
              try {
                // Find customer to link notification
                const customer = await prisma.customer.findFirst({
                  where: { zaloId: review.zaloUserId }
                })

                if (customer) {
                  // Create in-app notification
                  await prisma.notification.create({
                    data: {
                      title: `Phản hồi từ ${location.name}`,
                      content: `Cửa hàng đã phản hồi đánh giá của bạn: "${response.content.substring(0, 50)}..."`,
                      type: 'REVIEW',
                      customerId: customer.id,
                      isRead: false
                    }
                  })

                  // Send Zalo OA Message
                  const zaloClient = createZaloOAClient()
                  try {
                    await zaloClient.sendTextMessage(
                      review.zaloUserId,
                      `Cảm ơn bạn đã đánh giá! ${location.name} vừa phản hồi: "${response.content}"`
                    )
                    console.log(`Sent Zalo notification to ${review.zaloUserId}`)
                  } catch (zaloMsgError) {
                    console.error(`Failed to send Zalo OA message to ${review.zaloUserId}:`, zaloMsgError)
                  }
                }
              } catch (zaloError) {
                console.error(`Failed to process Zalo notification for review ${review.id}:`, zaloError)
                // Don't fail the whole process if notification fails
              }
            }

            processedCount++
          } catch (error: any) {
            console.error(`Failed to process response ${response.id}:`, error)
            errorDetails.push({ id: response.id, error: error.message || error })
            errorCount++
          }
        }
    }

    return NextResponse.json({
      success: true,
      scheduledNew: scheduledCount,
      processed: processedCount,
      errors: errorCount,
      errorDetails: errorDetails
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
