import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/mini-app/banners
 * Get featured locations as banners
 */
export async function GET(request: NextRequest) {
  try {
    // Get top rated locations with cover images
    const locations = await prisma.location.findMany({
      where: {
        isActive: true,
        // In a real app, you might have a 'isFeatured' flag
      },
      select: {
        id: true,
        name: true,
        coverImage: true,
        business: {
          select: {
            name: true,
          }
        }
      },
      take: 5,
      orderBy: {
        reviews: {
          _count: 'desc'
        }
      }
    })

    // If no locations have cover images, use placeholders but with real names
    const banners = locations.map(loc => ({
      id: loc.id,
      image: loc.coverImage || `https://placehold.co/600x300/7649f3/ffffff?text=${encodeURIComponent(loc.name)}`,
      title: loc.name,
      subtitle: loc.business.name
    }))

    return NextResponse.json({
      success: true,
      data: banners
    })
  } catch (error) {
    console.error('Get banners error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}
