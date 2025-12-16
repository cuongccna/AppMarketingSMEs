import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const connectPlatformSchema = z.object({
  locationId: z.string().min(1),
  platform: z.enum(['GOOGLE_BUSINESS_PROFILE', 'ZALO_OA', 'FACEBOOK']),
  externalId: z.string().min(1),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
})

/**
 * POST /api/businesses/[id]/connect-platform
 * Connect a platform to a location
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: (session.user as any).id,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const body = await request.json()
    const data = connectPlatformSchema.parse(body)

    // Check location belongs to business
    const location = await prisma.location.findFirst({
      where: {
        id: data.locationId,
        businessId,
      },
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    // Check if already connected
    const existingConnection = await prisma.platformConnection.findUnique({
      where: {
        locationId_platform: {
          locationId: data.locationId,
          platform: data.platform,
        },
      },
    })

    if (existingConnection) {
      // Update existing connection
      const connection = await prisma.platformConnection.update({
        where: { id: existingConnection.id },
        data: {
          externalId: data.externalId,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isConnected: true,
          lastSyncAt: new Date(),
        },
      })
      return NextResponse.json({ success: true, connection })
    }

    // Create new connection
    const connection = await prisma.platformConnection.create({
      data: {
        locationId: data.locationId,
        platform: data.platform,
        externalId: data.externalId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isConnected: true,
        lastSyncAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, connection }, { status: 201 })
  } catch (error) {
    console.error('Connect platform error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/businesses/[id]/connect-platform
 * Disconnect a platform from a location
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: businessId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')
    const platform = searchParams.get('platform')

    if (!locationId || !platform) {
      return NextResponse.json({ error: 'Missing locationId or platform' }, { status: 400 })
    }

    // Check business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: (session.user as any).id,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check location belongs to business
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        businessId,
      },
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    // Delete connection
    await prisma.platformConnection.deleteMany({
      where: {
        locationId: locationId,
        platform: platform as any,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Disconnect platform error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}




