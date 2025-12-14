import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { ReviewStatus } from '@prisma/client'

const updateLocationSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  phone: z.string().optional(),
  pointsPerReview: z.number().int().min(0).optional(),
})

/**
 * GET /api/locations/[id]
 * Get a single location
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const location = await prisma.location.findUnique({
      where: { id: params.id },
      include: {
        business: {
          select: { id: true, name: true, userId: true },
        },
        platformConnections: true,
        _count: {
          select: { reviews: true },
        },
      },
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    // Verify ownership
    if (location.business.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get review stats
    const reviewStats = await prisma.review.aggregate({
      where: { locationId: params.id },
      _avg: { rating: true },
      _count: true,
    })

    const sentimentCounts = await prisma.review.groupBy({
      by: ['sentiment'],
      where: { locationId: params.id },
      _count: true,
    })

    const pendingCount = await prisma.review.count({
      where: {
        locationId: params.id,
        status: { in: [ReviewStatus.NEW, ReviewStatus.AI_DRAFT_READY, ReviewStatus.PENDING_RESPONSE] },
      },
    })

    const lastReview = await prisma.review.findFirst({
      where: { locationId: params.id },
      orderBy: { publishedAt: 'desc' },
      select: { publishedAt: true },
    })

    return NextResponse.json({
      location: {
        ...location,
        averageRating: reviewStats._avg.rating || 0,
        totalReviews: reviewStats._count,
        pendingResponseCount: pendingCount,
        positiveReviews: sentimentCounts.find(s => s.sentiment === 'POSITIVE')?._count || 0,
        neutralReviews: sentimentCounts.find(s => s.sentiment === 'NEUTRAL')?._count || 0,
        negativeReviews: sentimentCounts.find(s => s.sentiment === 'NEGATIVE')?._count || 0,
        lastReviewDate: lastReview?.publishedAt,
      },
    })
  } catch (error) {
    console.error('Get location error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/locations/[id]
 * Update a location
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = updateLocationSchema.parse(body)

    // Verify ownership
    const location = await prisma.location.findUnique({
      where: { id: params.id },
      include: { business: { select: { userId: true } } },
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    if (location.business.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.location.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json({ location: updated })
  } catch (error) {
    console.error('Update location error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/locations/[id]
 * Delete a location
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const location = await prisma.location.findUnique({
      where: { id: params.id },
      include: { business: { select: { userId: true } } },
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    if (location.business.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check for existing reviews
    const reviewCount = await prisma.review.count({
      where: { locationId: params.id },
    })

    // Check for existing redemptions
    const redemptionCount = await prisma.redemption.count({
      where: {
        reward: {
          locationId: params.id,
        },
      },
    })

    if (reviewCount > 0 || redemptionCount > 0) {
      return NextResponse.json(
        {
          error: `Không thể xóa địa điểm đã có phát sinh giao dịch (${reviewCount} đánh giá, ${redemptionCount} đổi quà). Vui lòng liên hệ admin để xử lý.`,
        },
        { status: 400 }
      )
    }

    // Delete location (this will cascade delete reviews and responses)
    await prisma.location.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete location error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
