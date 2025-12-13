import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/mini-app/rewards/status
 * Check status of a redemption request
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    }

    const redemption = await prisma.redemption.findUnique({
      where: { id },
      select: { status: true }
    })

    if (!redemption) {
      return NextResponse.json({ success: false, error: 'Redemption not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { status: redemption.status }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/mini-app/rewards/confirm
 * Confirm redemption (Called by Staff App)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ success: false, error: 'Missing code' }, { status: 400 })
    }

    const redemption = await prisma.redemption.findUnique({
      where: { code },
      include: { reward: true, customer: true }
    })

    if (!redemption) {
      return NextResponse.json({ success: false, error: 'Invalid code' }, { status: 404 })
    }

    if (redemption.status === 'COMPLETED') {
      return NextResponse.json({ success: false, error: 'Code already used' }, { status: 400 })
    }

    if (redemption.status !== 'PENDING') {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }

    // Check points again just in case
    if (redemption.customer.points < redemption.pointsSpent) {
      return NextResponse.json({ success: false, error: 'Customer does not have enough points' }, { status: 400 })
    }

    // Execute Transaction
    await prisma.$transaction(async (tx) => {
      // Deduct points
      await tx.customer.update({
        where: { id: redemption.customerId },
        data: { points: { decrement: redemption.pointsSpent } }
      })

      // Create Point Transaction
      await tx.pointTransaction.create({
        data: {
          customerId: redemption.customerId,
          amount: -redemption.pointsSpent,
          type: 'REDEEM',
          description: `Đổi quà: ${redemption.reward.name}`
        }
      })

      // Update Redemption Status
      await tx.redemption.update({
        where: { id: redemption.id },
        data: { status: 'COMPLETED' }
      })

      // Create Notification
      await tx.notification.create({
        data: {
          customerId: redemption.customerId,
          title: 'Đổi quà thành công!',
          content: `Bạn đã đổi thành công "${redemption.reward.name}".`,
          type: 'PROMOTION'
        }
      })
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Redemption confirmed' }
    })

  } catch (error) {
    console.error('Error confirming redemption:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
