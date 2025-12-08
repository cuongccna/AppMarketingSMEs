import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'
import { handleWebhookEvent, PLANS, type PlanType } from '@/lib/stripe'
import Stripe from 'stripe'

/**
 * POST /api/subscription/webhook
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const event = await handleWebhookEvent(body, signature)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planType = session.metadata?.planType as PlanType

  if (!userId || !planType) {
    console.error('Missing userId or planType in checkout session metadata')
    return
  }

  const subscriptionId = session.subscription as string
  const customerId = session.customer as string

  // Upsert subscription in database
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      plan: planType,
      status: 'ACTIVE',
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelAtPeriodEnd: false,
    },
    create: {
      userId,
      plan: planType,
      status: 'ACTIVE',
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    },
  })

  console.log(`Subscription activated for user ${userId}: ${planType}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    // Try to find by stripe subscription ID
    const existingSub = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    })
    if (!existingSub) {
      console.error('Cannot find subscription for update')
      return
    }
  }

  const priceId = subscription.items.data[0]?.price.id
  let planType: PlanType = 'FREE'
  
  // Determine plan from price ID
  if (priceId === process.env.STRIPE_ESSENTIAL_PRICE_ID) {
    planType = 'ESSENTIAL'
  } else if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
    planType = 'PROFESSIONAL'
  }

  // Map Stripe status to our status (must match SubscriptionStatus enum in Prisma)
  let status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' = 'ACTIVE'
  if (subscription.status === 'canceled') status = 'CANCELED'
  else if (subscription.status === 'past_due') status = 'PAST_DUE'
  else if (subscription.status === 'trialing') status = 'TRIALING'

  // Get period dates from subscription object
  const periodStart = (subscription as any).current_period_start 
    ? new Date((subscription as any).current_period_start * 1000)
    : new Date()
  const periodEnd = (subscription as any).current_period_end
    ? new Date((subscription as any).current_period_end * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      plan: planType,
      status,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })

  console.log(`Subscription updated: ${subscription.id}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      plan: 'FREE',
      status: 'CANCELED',
      stripeSubscriptionId: null,
      cancelAtPeriodEnd: false,
    },
  })

  console.log(`Subscription cancelled: ${subscription.id}`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Access subscription from invoice (use any cast for flexibility with Stripe versions)
  const subscriptionId = (invoice as any).subscription as string | null
  
  if (subscriptionId) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        status: 'ACTIVE',
      },
    })
  }

  console.log(`Payment succeeded for invoice: ${invoice.id}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Access subscription from invoice (use any cast for flexibility with Stripe versions)
  const subscriptionId = (invoice as any).subscription as string | null
  
  if (subscriptionId) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        status: 'PAST_DUE',
      },
    })
  }

  console.log(`Payment failed for invoice: ${invoice.id}`)
}
