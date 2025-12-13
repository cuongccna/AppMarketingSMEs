import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/zalo/disconnect
 * Disconnect Zalo OA from account
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all Zalo OA connections for this user
    const businesses = await prisma.business.findMany({
      where: { userId: (session.user as { id: string }).id },
      include: {
        locations: {
          include: {
            platformConnections: {
              where: { platform: 'ZALO_OA' },
            },
          },
        },
      },
    })

    // Disconnect all Zalo OA connections
    const connectionIds: string[] = []
    for (const business of businesses) {
      for (const location of business.locations) {
        for (const conn of location.platformConnections) {
          connectionIds.push(conn.id)
        }
      }
    }

    if (connectionIds.length > 0) {
      await prisma.platformConnection.updateMany({
        where: { id: { in: connectionIds } },
        data: {
          isConnected: false,
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Zalo disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Zalo OA' },
      { status: 500 }
    )
  }
}
