import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { 
  createCheckoutSession, 
  createPortalSession, 
  PLANS,
  type PlanType 
} from '@/lib/stripe'
import { z } from 'zod'

// Request schemas
const checkoutSchema = z.object({
  planType: z.enum(['ESSENTIAL', 'PROFESSIONAL']),
})

const portalSchema = z.object({
  returnUrl: z.string().url().optional(),
})

/**
 * POST /api/subscription/checkout
 * Create a Stripe checkout session for subscription
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planType } = checkoutSchema.parse(body)

    const userId = (session.user as any).id
    const email = session.user.email || ''

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (existingSubscription?.status === 'ACTIVE' && existingSubscription.plan !== 'FREE') {
      // If they already have a paid subscription, redirect to portal
      if (existingSubscription.stripeCustomerId) {
        const portalSession = await createPortalSession(
          existingSubscription.stripeCustomerId,
          `${process.env.NEXTAUTH_URL}/dashboard/settings?tab=billing`
        )
        return NextResponse.json({ 
          redirectUrl: portalSession.url,
          message: 'Redirecting to billing portal' 
        })
      }
    }

    // Create checkout session
    const checkoutSession = await createCheckoutSession(
      userId,
      email,
      planType as PlanType,
      `${process.env.NEXTAUTH_URL}/dashboard?upgrade=success`,
      `${process.env.NEXTAUTH_URL}/dashboard?upgrade=cancelled`
    )

    return NextResponse.json({
      sessionId: checkoutSession.sessionId,
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
      // Return default free plan
      return NextResponse.json({
        plan: 'FREE',
        status: 'ACTIVE',
        features: PLANS.FREE.features,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      })
    }

    const planDetails = PLANS[subscription.plan as PlanType] || PLANS.FREE

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      features: planDetails.features,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      stripeCustomerId: subscription.stripeCustomerId,
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
