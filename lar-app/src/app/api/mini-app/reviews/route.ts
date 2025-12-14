import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ZaloOAClient } from '@/lib/zalo-oa'

export const dynamic = 'force-dynamic'

/**
 * POST /api/mini-app/reviews
 * Submit a new review from Zalo Mini App
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { locationId, rating, content, zaloUserId, zaloUserName, zaloPhone } = body

    // Validate required fields
    if (!locationId || !rating || !zaloUserId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get location to verify it exists
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        business: {
          include: {
            user: true,
          },
        },
        platformConnections: {
          where: {
            platform: 'ZALO_OA',
            isConnected: true,
          },
        },
      },
    })

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        locationId,
        platform: 'ZALO_OA',
        externalId: `zalo_${zaloUserId}_${Date.now()}`,
        authorName: zaloUserName || 'Khách hàng Zalo',
        zaloUserId,
        rating,
        content: content || '',
        sentiment: rating >= 4 ? 'POSITIVE' : rating <= 2 ? 'NEGATIVE' : 'NEUTRAL',
        publishedAt: new Date(),
        status: 'NEW',
      },
    })

    // Award loyalty points
    let pointsAwarded = 0
    try {
      // Find or create customer
      let customer = await prisma.customer.findFirst({
        where: { 
          zaloId: zaloUserId,
          businessId: location.businessId
        },
      })

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            zaloId: zaloUserId,
            businessId: location.businessId,
            name: zaloUserName,
            phone: zaloPhone,
          },
        })
      }

      // Award points based on location settings
      pointsAwarded = location.pointsPerReview || 10
      await prisma.$transaction([
        prisma.customer.update({
          where: { id: customer.id },
          data: { points: { increment: pointsAwarded } },
        }),
        prisma.pointTransaction.create({
          data: {
            customerId: customer.id,
            amount: pointsAwarded,
            type: 'REVIEW',
            description: `Đánh giá địa điểm ${location.name}`,
          },
        }),
        // Link review to customer
        prisma.review.update({
          where: { id: review.id },
          data: { customerId: customer.id }
        })
      ])
    } catch (error) {
      console.error('Failed to award points:', error)
      // Don't fail the request if points fail
    }

    // Send notification to business owner via Zalo ZNS (if connected)
    const zaloConnection = location.platformConnections[0]
    if (zaloConnection?.accessToken) {
      try {
        const zaloClient = new ZaloOAClient({
          appId: process.env.ZALO_APP_ID!,
          appSecret: process.env.ZALO_APP_SECRET!,
          accessToken: zaloConnection.accessToken,
        })

        // Send message to OA followers who are admins
        // In production, you'd send ZNS to the owner's phone
        console.log('New review notification would be sent to business owner')
      } catch (error) {
        console.error('Failed to send notification:', error)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reviewId: review.id,
        message: 'Cảm ơn bạn đã đánh giá! Chúng tôi rất trân trọng ý kiến của bạn.',
        pointsAwarded,
      },
    })
  } catch (error) {
    console.error('Mini app submit review error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/mini-app/reviews
 * Get reviews for a location (for mini app display)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locationId = searchParams.get('locationId')
    const zaloId = searchParams.get('zaloId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!locationId && !zaloId) {
      return NextResponse.json(
        { success: false, error: 'locationId or zaloId is required' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit
    const whereClause = locationId ? { locationId } : { zaloUserId: zaloId }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        select: {
          id: true,
          authorName: true,
          rating: true,
          content: true,
          publishedAt: true,
          platform: true,
          location: zaloId ? {
            select: {
              name: true,
              address: true
            }
          } : undefined,
          responses: {
            where: { status: 'PUBLISHED' },
            select: {
              content: true,
              createdAt: true,
            },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.review.count({
        where: whereClause,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews.map((r) => ({
          id: r.id,
          author: r.authorName,
          rating: r.rating,
          content: r.content,
          date: r.publishedAt.toISOString(),
          platform: r.platform,
          reply: r.responses[0]
            ? {
                content: r.responses[0].content,
                date: r.responses[0].createdAt?.toISOString(),
              }
            : null,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Mini app get reviews error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
