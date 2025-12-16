import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { GoogleBusinessProfileClient } from '@/lib/google-business'
import { createZaloOAClient } from '@/lib/zalo-oa'

export const dynamic = 'force-dynamic'

export async function GET(
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

    // Get connection
    const connection = await prisma.platformConnection.findUnique({
      where: {
        locationId_platform: {
          locationId: locationId,
          platform: platform as any,
        },
      },
    })

    if (!connection) {
      return NextResponse.json({ status: 'NOT_CONNECTED', message: 'Connection not found' })
    }

    if (!connection.accessToken) {
      return NextResponse.json({ status: 'INVALID', message: 'No access token' })
    }

    // Verify connection based on platform
    try {
      if (platform === 'GOOGLE_BUSINESS_PROFILE') {
        const gbpClient = new GoogleBusinessProfileClient(connection.accessToken)
        // Try to list accounts as a lightweight check
        await gbpClient.listAccounts()
        return NextResponse.json({ status: 'ACTIVE', message: 'Connection is active' })
      } else if (platform === 'ZALO_OA') {
        // For Zalo, we need to construct client with the stored token
        // Note: createZaloOAClient uses env vars, but we need to use the specific token
        // We'll instantiate ZaloOAClient directly or mock a config
        // Looking at ZaloOAClient class, it takes config in constructor
        
        // We need to import ZaloOAClient class, not just createZaloOAClient function
        // But createZaloOAClient is exported. Let's check if ZaloOAClient class is exported.
        // Yes it is.
        
        // However, ZaloOAClient constructor takes appId and appSecret too.
        // We can use the env vars for appId/Secret and the stored token for accessToken.
        
        const { ZaloOAClient } = require('@/lib/zalo-oa')
        const zaloClient = new ZaloOAClient({
          appId: process.env.ZALO_APP_ID || '',
          appSecret: process.env.ZALO_APP_SECRET || '',
          accessToken: connection.accessToken
        })
        
        await zaloClient.getProfile()
        return NextResponse.json({ status: 'ACTIVE', message: 'Connection is active' })
      } else {
        return NextResponse.json({ status: 'UNKNOWN', message: 'Unknown platform' })
      }
    } catch (error: any) {
      console.error(`Connection check failed for ${platform}:`, error)
      return NextResponse.json({ 
        status: 'ERROR', 
        message: error.message || 'Connection check failed',
        details: error.toString()
      })
    }

  } catch (error) {
    console.error('Check connection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
