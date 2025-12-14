import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const createRewardSchema = z.object({
  locationId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  pointsRequired: z.number().int().min(1),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/rewards
 * List rewards for a location
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')

    if (!locationId) {
      return NextResponse.json({ error: 'Missing locationId' }, { status: 400 })
    }

    // Verify ownership of location
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: { business: true }
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    if (location.business.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const rewards = await prisma.reward.findMany({
      where: { locationId },
      orderBy: { pointsRequired: 'asc' }
    })

    return NextResponse.json({ success: true, data: rewards })
  } catch (error) {
    console.error('Get rewards error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/rewards
 * Create a new reward
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createRewardSchema.parse(body)

    // Verify ownership of location
    const location = await prisma.location.findUnique({
      where: { id: data.locationId },
      include: { business: true }
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    if (location.business.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const reward = await prisma.reward.create({
      data: {
        locationId: data.locationId,
        name: data.name,
        description: data.description,
        image: data.image,
        pointsRequired: data.pointsRequired,
        isActive: data.isActive ?? true,
      }
    })

    return NextResponse.json({ success: true, data: reward })
  } catch (error) {
    console.error('Create reward error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
