import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * POST /api/mini-app/webhook/zalo
 * Webhook to handle Zalo Mini App events
 * Currently handles: User revoke consent (Data Deletion Callback)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, app_id, user_id, timestamp, sender_id } = body

    console.log('Received Zalo Webhook:', body)

    // Verify App ID
    if (app_id !== process.env.ZALO_APP_ID) {
      return NextResponse.json({ error: 'Invalid App ID' }, { status: 400 })
    }

    // Handle "User Revoke Consent" event (user_submit_data_deletion)
    // Note: Zalo might send different event names, but typically for data deletion it involves user_id
    if (event === 'user_submit_data_deletion' || (user_id && !event)) {
      // Find customer by Zalo User ID
      const customer = await prisma.customer.findFirst({
        where: { zaloId: user_id }
      })

      if (customer) {
        // Option 1: Delete customer data
        // await prisma.customer.delete({ where: { id: customer.id } })
        
        // Option 2: Anonymize data (Recommended for retention)
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            name: 'Deleted User',
            phone: null,
            email: null,
            avatar: null,
            zaloId: `deleted_${user_id}_${Date.now()}`,
          }
        })
        
        console.log(`Processed data deletion for Zalo User: ${user_id}`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Zalo Webhook Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * GET /api/mini-app/webhook/zalo
 * Verification endpoint if required by Zalo
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Zalo Webhook Endpoint is active' })
}
