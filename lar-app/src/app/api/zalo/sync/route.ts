import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ZaloOAClient } from '@/lib/zalo-oa'

export const dynamic = 'force-dynamic'

/**
 * POST /api/zalo/sync
 * Sync data from Zalo OA (followers, conversations, etc.)
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find Zalo OA connection
    const businesses = await prisma.business.findMany({
      where: { userId: (session.user as { id: string }).id },
      include: {
        locations: {
          include: {
            platformConnections: {
              where: { 
                platform: 'ZALO_OA',
                isConnected: true,
              },
            },
          },
        },
      },
    })

    let zaloConnection = null
    let locationId = ''
    
    for (const business of businesses) {
      for (const location of business.locations) {
        if (location.platformConnections.length > 0) {
          zaloConnection = location.platformConnections[0]
          locationId = location.id
          break
        }
      }
      if (zaloConnection) break
    }

    if (!zaloConnection) {
      return NextResponse.json(
        { error: 'Zalo OA not connected' },
        { status: 400 }
      )
    }

    // Initialize Zalo client
    const zaloClient = new ZaloOAClient({
      appId: process.env.ZALO_APP_ID!,
      appSecret: process.env.ZALO_APP_SECRET!,
      accessToken: zaloConnection.accessToken!,
    })

    // Get OA profile
    const profile = await zaloClient.getProfile()

    // Get followers count
    let followersCount = 0
    try {
      const followers = await zaloClient.getFollowers(0, 1)
      followersCount = followers.total || 0
    } catch (error) {
      console.error('Failed to get followers:', error)
    }

    // Update connection with latest data
    await prisma.platformConnection.update({
      where: { id: zaloConnection.id },
      data: {
        platformName: profile.name || zaloConnection.platformName,
        externalId: profile.oa_id || zaloConnection.externalId,
        lastSyncAt: new Date(),
        metadata: {
          ...(zaloConnection.metadata as object || {}),
          followers: followersCount,
          lastSyncProfile: profile,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        oaName: profile.name,
        oaId: profile.oa_id,
        followers: followersCount,
      },
    })
  } catch (error) {
    console.error('Zalo sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync Zalo OA' },
      { status: 500 }
    )
  }
}
