import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/zalo/auth
 * Generate Zalo OAuth URL for OA authorization
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appId = process.env.ZALO_APP_ID
    const redirectUri = process.env.ZALO_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/zalo/callback`
    
    if (!appId) {
      return NextResponse.json(
        { error: 'Zalo App ID not configured' },
        { status: 500 }
      )
    }

    // Create state with user info for security
    const state = Buffer.from(JSON.stringify({
      userId: (session.user as { id: string }).id,
      timestamp: Date.now(),
    })).toString('base64')

    // Zalo OA OAuth URL
    // https://developers.zalo.me/docs/api/official-account-api/xac-thuc-va-uy-quyen/cac-buoc-xac-thuc-post-4307
    const authUrl = new URL('https://oauth.zaloapp.com/v4/oa/permission')
    authUrl.searchParams.set('app_id', appId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', state)

    return NextResponse.json({ authUrl: authUrl.toString() })
  } catch (error) {
    console.error('Zalo auth error:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}
