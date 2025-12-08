import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
})

// Plan configurations
export const PLANS = {
  FREE: {
    name: 'Miễn phí',
    price: 0,
    priceId: null,
    features: {
      locations: 1,
      aiResponses: 10,
      platforms: ['GOOGLE_BUSINESS_PROFILE'],
      support: 'community',
      analytics: 'basic',
      templates: 3,
    },
  },
  ESSENTIAL: {
    name: 'Essential',
    price: 299000, // VND
    priceId: process.env.STRIPE_ESSENTIAL_PRICE_ID,
    features: {
      locations: 3,
      aiResponses: 100,
      platforms: ['GOOGLE_BUSINESS_PROFILE', 'ZALO_OA'],
      support: 'email',
      analytics: 'standard',
      templates: 10,
    },
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 599000, // VND
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
    features: {
      locations: 10,
      aiResponses: 500,
      platforms: ['GOOGLE_BUSINESS_PROFILE', 'ZALO_OA', 'FACEBOOK'],
      support: 'priority',
      analytics: 'advanced',
      templates: 'unlimited',
      customTone: true,
      apiAccess: true,
    },
  },
} as const

export type PlanType = keyof typeof PLANS

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  planType: PlanType,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string }> {
  const plan = PLANS[planType]
  
  if (!plan.priceId) {
    throw new Error('Cannot create checkout for free plan')
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planType,
    },
    subscription_data: {
      metadata: {
        userId,
        planType,
      },
    },
    locale: 'vi', // Vietnamese locale
    allow_promotion_codes: true,
  })

  return {
    sessionId: session.id,
    url: session.url || '',
  }
}

/**
 * Create a Stripe Portal Session for managing subscription
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ url: string }> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return { url: session.url }
}

/**
 * Get subscription details from Stripe
 */
export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId)
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
): Promise<Stripe.Subscription> {
  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId)
  }

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

/**
 * Resume a cancelled subscription
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

/**
 * Handle webhook events from Stripe
 */
export async function handleWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('Stripe webhook secret not configured')
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

/**
 * Create or get Stripe customer
 */
export async function createOrGetCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<string> {
  // Search for existing customer
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (customers.data.length > 0) {
    return customers.data[0].id
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  })

  return customer.id
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  return stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  })
}

export { stripe }
