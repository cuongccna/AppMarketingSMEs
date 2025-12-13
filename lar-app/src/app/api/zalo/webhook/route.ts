import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const ZALO_APP_SECRET = process.env.ZALO_APP_SECRET || ''

/**
 * Verify Zalo webhook signature
 */
function verifyZaloSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', ZALO_APP_SECRET)
    .update(body)
    .digest('hex')
  return signature === expectedSignature
}

/**
 * GET /api/zalo/webhook
 * Zalo webhook verification
 */
export async function GET(request: NextRequest) {
  // Zalo sends a challenge token for webhook verification
  const searchParams = request.nextUrl.searchParams
  const challenge = searchParams.get('challenge')
  
  if (challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  
  return NextResponse.json({ status: 'Webhook is active' })
}

/**
 * POST /api/zalo/webhook
 * Receive events from Zalo OA
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('X-ZaloOA-Signature') || ''
    
    // Verify signature (optional but recommended)
    // if (!verifyZaloSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }
    
    const event = JSON.parse(body)
    console.log('Zalo webhook event:', event)
    
    // Handle different event types
    switch (event.event_name) {
      case 'user_send_text':
        await handleUserMessage(event)
        break
      
      case 'follow':
        await handleFollow(event)
        break
      
      case 'unfollow':
        await handleUnfollow(event)
        break
      
      case 'user_send_image':
      case 'user_send_link':
      case 'user_send_audio':
      case 'user_send_video':
      case 'user_send_sticker':
      case 'user_send_gif':
      case 'user_send_file':
        await handleUserMedia(event)
        break
      
      default:
        console.log('Unhandled event type:', event.event_name)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Zalo webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Handle text message from user
 */
async function handleUserMessage(event: any) {
  const { sender, message, timestamp, oa_id } = event
  const userId = sender.id
  const text = message.text
  
  console.log(`Message from ${userId} to OA ${oa_id}: ${text}`)
  
  // Find business connected to this Zalo OA
  const connection = await prisma.platformConnection.findFirst({
    where: {
      platform: 'ZALO_OA',
      isConnected: true,
      externalId: oa_id, // Filter by OA ID
    },
    include: {
      location: {
        include: {
          business: true,
        },
      },
    },
  })
  
  if (!connection) {
    console.log(`No Zalo OA connection found for OA ID ${oa_id}`)
    return
  }
  
  // Save message to database (optional - for chat history)
  // You could create a ZaloMessage model for this
  
  // Auto-reply based on keywords (simple chatbot)
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('giờ mở cửa') || lowerText.includes('mấy giờ')) {
    // Send business hours
    await sendAutoReply(connection.accessToken!, userId, 
      `Chào bạn! ${connection.location.business.name} mở cửa từ 8:00 - 22:00 hàng ngày. Chúng tôi rất vui được phục vụ bạn!`)
  } else if (lowerText.includes('địa chỉ') || lowerText.includes('ở đâu')) {
    // Send address
    await sendAutoReply(connection.accessToken!, userId,
      `Địa chỉ của chúng tôi: ${connection.location.address}. Hẹn gặp bạn!`)
  } else if (lowerText.includes('menu') || lowerText.includes('thực đơn')) {
    await sendAutoReply(connection.accessToken!, userId,
      `Cảm ơn bạn đã quan tâm! Vui lòng truy cập website hoặc ghé trực tiếp cửa hàng để xem thực đơn đầy đủ nhé.`)
  } else {
    // Default auto-reply
    await sendAutoReply(connection.accessToken!, userId,
      `Cảm ơn bạn đã liên hệ ${connection.location.business.name}! Chúng tôi sẽ phản hồi sớm nhất có thể.`)
  }
}

/**
 * Handle new follower
 */
async function handleFollow(event: any) {
  const { follower, oa_id } = event
  console.log(`New follower: ${follower.id} for OA ${oa_id}`)
  
  // Send welcome message
  const connection = await prisma.platformConnection.findFirst({
    where: {
      platform: 'ZALO_OA',
      isConnected: true,
      externalId: oa_id,
    },
    include: {
      location: {
        include: {
          business: true,
        },
      },
    },
  })
  
  if (connection?.accessToken) {
    await sendAutoReply(connection.accessToken, follower.id,
      `Chào mừng bạn đến với ${connection.location.business.name}! 🎉\n\nCảm ơn bạn đã quan tâm. Chúng tôi sẽ gửi thông báo về các chương trình ưu đãi và tin tức mới nhất đến bạn.`)
  }
}

/**
 * Handle unfollow
 */
async function handleUnfollow(event: any) {
  const { follower } = event
  console.log(`User unfollowed: ${follower.id}`)
  // Log or handle unfollow event
}

/**
 * Handle media messages
 */
async function handleUserMedia(event: any) {
  const { sender, message } = event
  console.log(`Media from ${sender.id}:`, message)
  // Handle media messages if needed
}

/**
 * Send auto-reply via Zalo OA
 */
async function sendAutoReply(accessToken: string, userId: string, text: string) {
  try {
    const response = await fetch('https://openapi.zalo.me/v2.0/oa/message', {
      method: 'POST',
      headers: {
        'access_token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { user_id: userId },
        message: { text },
      }),
    })
    
    const data = await response.json()
    if (data.error !== 0) {
      console.error('Failed to send Zalo message:', data)
    }
  } catch (error) {
    console.error('Error sending Zalo message:', error)
  }
}
