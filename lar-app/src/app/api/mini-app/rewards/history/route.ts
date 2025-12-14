import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/mini-app/rewards/history
 * Get redemption history for a customer
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const zaloId = searchParams.get('zaloId')

    if (!zaloId) {
      return NextResponse.json({ success: false, error: 'Missing zaloId' }, { status: 400 })
    }

    const customers = await prisma.customer.findMany({
      where: { zaloId },
      select: { id: true }
    })

    if (customers.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const customerIds = customers.map(c => c.id)

    const redemptions = await prisma.redemption.findMany({
      where: { customerId: { in: customerIds } },
      include: {
        reward: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: redemptions
    })
  } catch (error) {
    console.error('Error fetching redemption history:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
