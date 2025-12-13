import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ZaloOAClient } from '@/lib/zalo-oa'

export const dynamic = 'force-dynamic'

/**
 * GET /api/zalo/callback
 * Handle Zalo OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const oaId = searchParams.get('oa_id')

    if (!code || !state) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=missing_params', request.url))
    }

    // Decode state
    let stateData: { userId: string; timestamp: number }
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    } catch {
      return NextResponse.redirect(new URL('/dashboard/settings?error=invalid_state', request.url))
    }

    // Verify state is not too old (5 minutes)
    if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=expired_state', request.url))
    }

    const appId = process.env.ZALO_APP_ID!
    const appSecret = process.env.ZALO_APP_SECRET!
    const redirectUri = process.env.ZALO_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/zalo/callback`

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'secret_key': appSecret,
      },
      body: new URLSearchParams({
        app_id: appId,
        code,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      console.error('Zalo token error:', tokenData)
      return NextResponse.redirect(new URL('/dashboard/settings?error=token_error', request.url))
    }

    const { access_token, refresh_token, expires_in } = tokenData

    // Get OA profile
    const zaloClient = new ZaloOAClient({
      appId,
      appSecret,
      accessToken: access_token,
    })

    let oaProfile: { name?: string; oa_id?: string } = {}
    try {
      oaProfile = await zaloClient.getProfile()
    } catch (error) {
      console.error('Failed to get OA profile:', error)
    }

    // Find user's first business and location to store the connection
    const user = await prisma.user.findUnique({
      where: { id: stateData.userId },
      include: {
        businesses: {
          include: {
            locations: true,
          },
        },
      },
    })

    if (!user || user.businesses.length === 0) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=no_business', request.url))
    }

    const location = user.businesses[0].locations[0]
    if (!location) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=no_location', request.url))
    }

    // Upsert platform connection
    await prisma.platformConnection.upsert({
      where: {
        locationId_platform: {
          locationId: location.id,
          platform: 'ZALO_OA',
        },
      },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        externalId: oaId || oaProfile.oa_id || '',
        platformName: oaProfile.name || 'Zalo OA',
        isConnected: true,
        lastSyncAt: new Date(),
      },
      create: {
        locationId: location.id,
        platform: 'ZALO_OA',
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        externalId: oaId || oaProfile.oa_id || '',
        platformName: oaProfile.name || 'Zalo OA',
        isConnected: true,
        lastSyncAt: new Date(),
      },
    })

    // Redirect to settings with success
    return NextResponse.redirect(new URL('/dashboard/settings?tab=integrations&success=zalo_connected', request.url))
  } catch (error) {
    console.error('Zalo callback error:', error)
    return NextResponse.redirect(new URL('/dashboard/settings?error=callback_error', request.url))
  }
}
