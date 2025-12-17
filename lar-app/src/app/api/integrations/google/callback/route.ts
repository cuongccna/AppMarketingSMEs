import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      return NextResponse.redirect(new URL('/dashboard/businesses?error=missing_params', request.url))
    }

    let stateData: { userId: string; locationId: string; timestamp: number }
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    } catch {
      return NextResponse.redirect(new URL('/dashboard/businesses?error=invalid_state', request.url))
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/google/callback`
    )

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user info to verify
    let userInfo;
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
      userInfo = await oauth2.userinfo.get()
    } catch (e: any) {
      console.error('Failed to get user info:', e)
      throw new Error(`UserInfo Error: ${e.message}`)
    }

    // Get GBP accounts/locations
    let accounts;
    try {
      const mybusinessAccount = google.mybusinessaccountmanagement({ version: 'v1', auth: oauth2Client })
      
      // Implement robust retry for accounts.list with exponential backoff
      let retries = 5;
      let delay = 3000; // Start with 3 seconds

      console.log('Starting Google Accounts List with retry logic...');

      while (retries > 0) {
        try {
          // Disable default googleapis retry to control backoff manually
          accounts = await mybusinessAccount.accounts.list({}, {
            retryConfig: { retry: 0 }
          })
          console.log('Google Accounts List success');
          break;
        } catch (e: any) {
          const isQuotaError = e.code === 429 || 
                               e.message?.includes('Quota exceeded') || 
                               e.status === 429;
          
          if (isQuotaError) {
            console.log(`Quota exceeded for accounts.list. Retrying in ${delay}ms... (${retries} retries left)`);
            retries--;
            if (retries === 0) throw e;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff: 3s, 6s, 12s, 24s, 48s
          } else {
            throw e;
          }
        }
      }
    } catch (e: any) {
      console.error('Failed to list accounts:', e)
      throw new Error(`Accounts List Error: ${e.message}`)
    }
    
    const account = accounts?.data?.accounts?.[0]
    if (!account || !account.name) {
         return NextResponse.redirect(new URL('/dashboard/businesses?error=no_gbp_account', request.url))
    }

    let locationsResponse;
    try {
      const mybusinessBusiness = google.mybusinessbusinessinformation({ version: 'v1', auth: oauth2Client })
      locationsResponse = await mybusinessBusiness.accounts.locations.list({
          parent: account.name,
          readMask: 'name,title,storeCode,metadata',
      })
    } catch (e: any) {
      console.error('Failed to list locations:', e)
      throw new Error(`Locations List Error: ${e.message}`)
    }
    
    const locations = locationsResponse.data.locations
    
    let externalId = ''
    let platformName = userInfo.data.email || 'Google Business Profile'

    if (locations && locations.length > 0) {
        // Pick the first one for now
        externalId = locations[0].name!
        platformName = locations[0].title!
    } else {
         return NextResponse.redirect(new URL('/dashboard/businesses?error=no_gbp_locations', request.url))
    }

    await prisma.platformConnection.upsert({
      where: {
        locationId_platform: {
          locationId: stateData.locationId,
          platform: 'GOOGLE_BUSINESS_PROFILE',
        },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        externalId: externalId,
        platformName: platformName,
        isConnected: true,
        lastSyncAt: new Date(),
      },
      create: {
        locationId: stateData.locationId,
        platform: 'GOOGLE_BUSINESS_PROFILE',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        externalId: externalId,
        platformName: platformName,
        isConnected: true,
        lastSyncAt: new Date(),
      },
    })

    return NextResponse.redirect(new URL('/dashboard/businesses?success=google_connected', request.url))

  } catch (error: any) {
    console.error('Google callback error:', error)
    const errorMessage = error?.message || 'Unknown error'
    return NextResponse.redirect(new URL(`/dashboard/businesses?error=callback_error&details=${encodeURIComponent(errorMessage)}`, request.url))
  }
}
