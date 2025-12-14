import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/mini-app/notifications
 * Get notifications for a customer
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const zaloId = searchParams.get('zaloId')

    // Base query: Global notifications OR user specific notifications
    const where: any = {
      OR: [
        { customerId: null }, // Global
      ]
    }

    if (zaloId) {
      // Find all customer records for this Zalo ID
      const customers = await prisma.customer.findMany({
        where: { zaloId },
        select: { id: true }
      })
      
      if (customers.length > 0) {
        const customerIds = customers.map(c => c.id)
        where.OR.push({ customerId: { in: customerIds } })
      }
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // If no notifications, return some welcome ones
    if (notifications.length === 0) {
      return NextResponse.json({
        success: true,
        data: [
          {
            id: 'welcome',
            title: 'Chào mừng bạn mới',
            content: 'Cảm ơn bạn đã sử dụng ứng dụng. Hãy khám phá các địa điểm thú vị nhé!',
            image: 'https://stc-zmp.zadn.vn/templates/zaui-coffee/dummy/banner-1.webp',
            createdAt: new Date().toISOString(),
            isRead: false
          }
        ]
      })
    }

    return NextResponse.json({
      success: true,
      data: notifications
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
