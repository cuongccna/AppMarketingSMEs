import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const businessSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
})

/**
 * GET /api/businesses
 * Get all businesses for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businesses = await prisma.business.findMany({
      where: { userId: (session.user as any).id },
      include: {
        locations: {
          include: {
            platformConnections: true,
            _count: {
              select: { reviews: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ businesses })
  } catch (error) {
    console.error('Get businesses error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/businesses
 * Create a new business
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = businessSchema.parse(body)

    // Check subscription limits
    const subscription = await prisma.subscription.findUnique({
      where: { userId: (session.user as any).id },
    })

    const existingBusinessCount = await prisma.business.count({
      where: { userId: (session.user as any).id },
    })

    // Free plan: 1 business only
    if (subscription?.plan === 'FREE' && existingBusinessCount >= 1) {
      return NextResponse.json(
        { error: 'Gói miễn phí chỉ cho phép 1 doanh nghiệp. Vui lòng nâng cấp.' },
        { status: 403 }
      )
    }

    const business = await prisma.business.create({
      data: {
        userId: (session.user as any).id,
        name: data.name,
        description: data.description,
        category: data.category,
        phone: data.phone,
        website: data.website || undefined,
      },
    })

    return NextResponse.json({ success: true, business })
  } catch (error) {
    console.error('Create business error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
