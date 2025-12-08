import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { PRICING_PLANS } from '@/lib/utils'

/**
 * GET /api/subscription
 * Get current user's subscription details
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (!subscription) {
      // Create default FREE subscription if not exists
      const newSubscription = await prisma.subscription.create({
        data: {
          userId,
          plan: 'FREE',
          status: 'ACTIVE',
        },
      })
      
      return NextResponse.json({
        subscription: newSubscription,
        planDetails: PRICING_PLANS.FREE,
      })
    }

    // Get usage stats for current month
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const usageStats = await prisma.usageStats.findUnique({
      where: {
        userId_month: {
          userId,
          month: currentMonth,
        },
      },
    })

    // Get location count
    const locationCount = await prisma.location.count({
      where: {
        business: { userId },
      },
    })

    const planDetails = PRICING_PLANS[subscription.plan as keyof typeof PRICING_PLANS]

    return NextResponse.json({
      subscription,
      planDetails,
      usage: {
        aiResponsesUsed: usageStats?.aiResponseCount || 0,
        aiResponsesLimit: planDetails.features.maxAiResponses,
        tokensUsed: usageStats?.tokensUsed || 0,
        locationsUsed: locationCount,
        locationsLimit: planDetails.features.maxLocations,
      },
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/subscription/upgrade
 * Upgrade subscription plan
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { plan } = await request.json()

    if (!['ESSENTIAL', 'PROFESSIONAL'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // In production, this would integrate with Stripe
    // For now, we'll just update the subscription directly
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      create: {
        userId,
        plan,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    return NextResponse.json({
      success: true,
      subscription,
      message: `Đã nâng cấp lên gói ${plan}`,
    })
  } catch (error) {
    console.error('Upgrade subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
