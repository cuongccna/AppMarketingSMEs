import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ZaloOAClient } from '@/lib/zalo-oa'

/**
 * POST /api/zalo/send-notification
 * Send ZNS notification to business owner about new review
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reviewId, type = 'NEW_REVIEW' } = await request.json()

    // Get review with location and business info
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        location: {
          include: {
            business: {
              include: {
                user: {
                  include: {
                    settings: true,
                  },
                },
              },
            },
            platformConnections: {
              where: {
                platform: 'ZALO_OA',
                isConnected: true,
              },
            },
          },
        },
      },
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const zaloConnection = review.location.platformConnections[0]
    if (!zaloConnection?.accessToken) {
      return NextResponse.json(
        { error: 'Zalo OA not connected for this location' },
        { status: 400 }
      )
    }

    // Get user's phone for ZNS from settings
    const userPhone = review.location.business.user.settings?.phone
    if (!userPhone) {
      return NextResponse.json(
        { error: 'User phone number not configured' },
        { status: 400 }
      )
    }

    // Initialize Zalo client
    const zaloClient = new ZaloOAClient({
      appId: process.env.ZALO_APP_ID!,
      appSecret: process.env.ZALO_APP_SECRET!,
      accessToken: zaloConnection.accessToken,
    })

    // Prepare notification based on type
    let templateId = ''
    let templateData: Record<string, string> = {}

    switch (type) {
      case 'NEW_REVIEW':
        // You need to create this template in Zalo Developer Console
        templateId = process.env.ZALO_ZNS_NEW_REVIEW_TEMPLATE || ''
        templateData = {
          customer_name: review.authorName,
          rating: `${review.rating}/5`,
          location_name: review.location.name,
          review_content: (review.content || 'Không có nội dung').substring(0, 100),
        }
        break
      
      case 'NEGATIVE_REVIEW':
        templateId = process.env.ZALO_ZNS_NEGATIVE_REVIEW_TEMPLATE || ''
        templateData = {
          customer_name: review.authorName,
          rating: `${review.rating}/5`,
          location_name: review.location.name,
          review_content: (review.content || 'Không có nội dung').substring(0, 100),
          urgency: 'Cần xử lý ngay',
        }
        break
      
      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    if (!templateId) {
      // Fallback: Send as regular OA message if no ZNS template
      // This requires user to follow the OA
      console.log('No ZNS template configured, skipping notification')
      return NextResponse.json({
        success: false,
        message: 'ZNS template not configured. Please set up templates in Zalo Developer Console.',
      })
    }

    // Send ZNS notification
    const result = await zaloClient.sendZNSNotification(
      userPhone,
      templateId,
      templateData
    )

    return NextResponse.json({
      success: true,
      messageId: result.msg_id,
      message: 'Notification sent successfully',
    })
  } catch (error) {
    console.error('Send ZNS notification error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send notification' },
      { status: 500 }
    )
  }
}
