import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const updateBusinessSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
})

/**
 * GET /api/businesses/[id]
 * Get a single business by ID
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

    const business = await prisma.business.findFirst({
      where: {
        id,
        userId: (session.user as any).id,
      },
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
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({ business })
  } catch (error) {
    console.error('Get business error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/businesses/[id]
 * Update a business
 */
export async function PUT(
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
    const existing = await prisma.business.findFirst({
      where: {
        id,
        userId: (session.user as any).id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const body = await request.json()
    const data = updateBusinessSchema.parse(body)

    const business = await prisma.business.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        phone: data.phone,
        website: data.website || undefined,
      },
    })

    return NextResponse.json({ success: true, business })
  } catch (error) {
    console.error('Update business error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/businesses/[id]
 * Delete a business
 */
export async function DELETE(
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
    const existing = await prisma.business.findFirst({
      where: {
        id,
        userId: (session.user as any).id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Cascade delete will handle locations, connections, reviews
    await prisma.business.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete business error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
