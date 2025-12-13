import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/integrations/status
 * Get status of all integrations for current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from session
    const userId = (session.user as { id?: string }).id
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 })
    }

    // Get user's businesses with platform connections
    const businesses = await prisma.business.findMany({
      where: { userId },
      include: {
        locations: {
          include: {
            platformConnections: true,
          },
        },
      },
    })

    // Find Zalo OA connection
    let zaloConnection = null
    for (const business of businesses) {
      for (const location of business.locations) {
        const zalo = location.platformConnections.find(
          (conn) => conn.platform === 'ZALO_OA' && conn.isConnected
        )
        if (zalo) {
          zaloConnection = zalo
          break
        }
      }
      if (zaloConnection) break
    }

    // Find Google Business connection
    let googleConnection = null
    for (const business of businesses) {
      for (const location of business.locations) {
        const google = location.platformConnections.find(
          (conn) => conn.platform === 'GOOGLE_BUSINESS_PROFILE' && conn.isConnected
        )
        if (google) {
          googleConnection = google
          break
        }
      }
      if (googleConnection) break
    }

    // Count connected Google locations
    const googleLocationsCount = businesses.reduce((count, business) => {
      return count + business.locations.filter((loc) =>
        loc.platformConnections.some((conn) => conn.platform === 'GOOGLE_BUSINESS_PROFILE' && conn.isConnected)
      ).length
    }, 0)

    return NextResponse.json({
      zaloOA: {
        connected: !!zaloConnection,
        oaName: zaloConnection?.platformName || '',
        oaId: zaloConnection?.externalId || '',
        followers: 0, // Would need to fetch from Zalo API
        lastSync: zaloConnection?.lastSyncAt?.toISOString() || null,
      },
      googleBusiness: {
        connected: !!googleConnection,
        accountName: googleConnection?.platformName || '',
        locationsCount: googleLocationsCount,
        lastSync: googleConnection?.lastSyncAt?.toISOString() || null,
      },
    })
  } catch (error) {
    console.error('Get integrations status error:', error)
    return NextResponse.json(
      { error: 'Failed to get integrations status' },
      { status: 500 }
    )
  }
}
