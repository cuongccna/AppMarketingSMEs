import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/mini-app/locations
 * Get locations list for Zalo Mini App (public endpoint)
 * 
 * Query params:
 * - businessId: optional, filter by business
 * - lat, lng: optional, for nearby search
 * - search: optional, search by name
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId')
    const search = searchParams.get('search')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    // Build query
    const where: any = {
      isActive: true,
    }

    if (businessId) {
      where.businessId = businessId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ]
    }

    const locations = await prisma.location.findMany({
      where,
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
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        platformConnections: {
          where: {
            platform: 'GOOGLE_BUSINESS_PROFILE',
            isConnected: true,
          },
          select: {
            externalId: true, // This is the Place ID
          },
          take: 1,
        },
      },
      take: 50,
    })

    // Transform for mini app with calculated stats
    const result = locations.map((loc) => {
      const reviewCount = loc.reviews.length
      const avgRating = reviewCount > 0 
        ? loc.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
        : 0
      
      const googlePlaceId = loc.platformConnections[0]?.externalId

      return {
        id: loc.id,
        name: loc.name,
        address: loc.address,
        phone: loc.phone,
        city: loc.city,
        district: loc.district,
        googlePlaceId,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount,
        businessName: loc.business.name,
        category: loc.business.category,
      }
    })

    // Sort by review count descending
    result.sort((a, b) => b.reviewCount - a.reviewCount)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Mini app locations error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
