import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/mini-app/rewards/redeem
 * Redeem a reward
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { zaloId, rewardId } = body

    if (!zaloId || !rewardId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 1. Get Customer and Reward
    const [customer, reward] = await Promise.all([
      prisma.customer.findUnique({ where: { zaloId } }),
      prisma.reward.findUnique({ where: { id: rewardId } })
    ])

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 })
    }
    if (!reward) {
      return NextResponse.json({ success: false, error: 'Reward not found' }, { status: 404 })
    }
    if (!reward.isActive) {
      return NextResponse.json({ success: false, error: 'Reward is no longer active' }, { status: 400 })
    }

    // 2. Check points
    if (customer.points < reward.pointsRequired) {
      return NextResponse.json({ success: false, error: 'Insufficient points' }, { status: 400 })
    }

    // 3. Create Redemption Request (PENDING)
    const code = Math.random().toString(36).substring(2, 10).toUpperCase(); // Simple random code

    const redemption = await prisma.redemption.create({
      data: {
        code,
        customerId: customer.id,
        rewardId: reward.id,
        pointsSpent: reward.pointsRequired,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        redemptionId: redemption.id,
        code: redemption.code,
        pointsRequired: reward.pointsRequired
      }
    })

  } catch (error) {
    console.error('Error requesting redemption:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
