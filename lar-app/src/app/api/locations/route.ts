import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const locationSchema = z.object({
  businessId: z.string(),
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().optional(),
  district: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phone: z.string().optional(),
})

/**
 * GET /api/locations
 * Get all locations for user's businesses
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    const where: any = {
      business: { userId: (session.user as any).id },
    }
    if (businessId) {
      where.businessId = businessId
    }

    const locations = await prisma.location.findMany({
      where,
      include: {
        business: {
          select: { id: true, name: true },
        },
        platformConnections: true,
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ locations })
  } catch (error) {
    console.error('Get locations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/locations
 * Create a new location
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = locationSchema.parse(body)

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: data.businessId,
        userId: (session.user as any).id,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check subscription limits for locations
    const subscription = await prisma.subscription.findUnique({
      where: { userId: (session.user as any).id },
    })

    const existingLocationCount = await prisma.location.count({
      where: { business: { userId: (session.user as any).id } },
    })

    const limits = {
      FREE: 1,
      ESSENTIAL: 5,
      PROFESSIONAL: -1, // unlimited
    }

    const limit = limits[subscription?.plan || 'FREE']
    if (limit !== -1 && existingLocationCount >= limit) {
      return NextResponse.json(
        { error: `Gói ${subscription?.plan || 'FREE'} chỉ cho phép ${limit} địa điểm. Vui lòng nâng cấp.` },
        { status: 403 }
      )
    }

    const location = await prisma.location.create({
      data: {
        businessId: data.businessId,
        name: data.name,
        address: data.address,
        city: data.city,
        district: data.district,
        latitude: data.latitude,
        longitude: data.longitude,
        phone: data.phone,
      },
    })

    return NextResponse.json({ success: true, location })
  } catch (error) {
    console.error('Create location error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
