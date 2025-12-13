import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/mini-app/locations/[id]
 * Get location details for Zalo Mini App
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const location = await prisma.location.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        city: true,
        district: true,
        business: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
          },
        },
        reviews: {
          select: {
            id: true,
            authorName: true,
            rating: true,
            content: true,
            publishedAt: true,
            responses: {
              where: {
                status: 'PUBLISHED',
              },
              select: {
                content: true,
                createdAt: true,
              },
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
          take: 20,
          orderBy: { publishedAt: 'desc' },
        },
      },
    })

    if (!location) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      )
    }

    // Calculate review stats
    const reviewCount = location.reviews.length
    const avgRating = reviewCount > 0 
      ? location.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
      : 0

    // Transform for mini app
    const result = {
      id: location.id,
      name: location.name,
      address: location.address,
      phone: location.phone,
      city: location.city,
      district: location.district,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount,
      business: {
        id: location.business.id,
        name: location.business.name,
        category: location.business.category,
        description: location.business.description,
      },
      reviews: location.reviews.map((review) => ({
        id: review.id,
        author: review.authorName,
        rating: review.rating,
        content: review.content,
        date: review.publishedAt.toISOString(),
        reply: review.responses[0]
          ? {
              content: review.responses[0].content,
              date: review.responses[0].createdAt?.toISOString(),
            }
          : null,
      })),
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Mini app location detail error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch location' },
      { status: 500 }
    )
  }
}
