import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const locationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().optional(),
  district: z.string().optional(),
  phone: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

/**
 * GET /api/businesses/[id]/locations
 * Get all locations for a business
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check ownership
    const business = await prisma.business.findFirst({
      where: {
        id,
        userId: (session.user as any).id,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const locations = await prisma.location.findMany({
      where: { businessId: id },
      include: {
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
 * POST /api/businesses/[id]/locations
 * Create a new location for a business
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check ownership
    const business = await prisma.business.findFirst({
      where: {
        id,
        userId: (session.user as any).id,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check subscription limits
    const subscription = await prisma.subscription.findUnique({
      where: { userId: (session.user as any).id },
    })

    const existingLocationCount = await prisma.location.count({
      where: {
        business: {
          userId: (session.user as any).id,
        },
      },
    })

    // Plan limits
    const planLimits: Record<string, number> = {
      FREE: 1,
      ESSENTIAL: 5,
      PROFESSIONAL: Infinity,
    }

    const limit = planLimits[subscription?.plan || 'FREE'] || 1

    if (existingLocationCount >= limit) {
      return NextResponse.json(
        { error: `Gói ${subscription?.plan || 'FREE'} chỉ cho phép ${limit} địa điểm. Vui lòng nâng cấp.` },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = locationSchema.parse(body)

    const location = await prisma.location.create({
      data: {
        businessId: id,
        name: data.name,
        address: data.address,
        city: data.city,
        district: data.district,
        phone: data.phone,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    })

    return NextResponse.json({ success: true, location }, { status: 201 })
  } catch (error) {
    console.error('Create location error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
