import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { GoogleBusinessProfileClient } from '@/lib/google-business'

export const dynamic = 'force-dynamic' // Ensure it's not cached

export async function GET(request: NextRequest) {
  try {
    // Find scheduled responses that are due
    const now = new Date()
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

    if (scheduledResponses.length === 0) {
      return NextResponse.json({ message: 'No scheduled responses to process' })
    }

    let processedCount = 0
    let errorCount = 0

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

    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errorCount,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
