import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/mini-app/notifications/read
 * Mark a notification as read
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing notification id' }, { status: 400 })
    }

    // If it's the fake welcome notification, just return success
    if (id === 'welcome') {
      return NextResponse.json({ success: true })
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
