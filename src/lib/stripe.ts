import Stripe from 'stripe';

// Initialize Stripe only when needed
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
  });
}

export const stripe = getStripe;

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

// Pricing plans
export const PRICING_PLANS = {
  individual: {
    name: 'Individual',
    description: 'Perfect for researchers and journalists',
    price: 9,
    currency: 'eur',
    interval: 'month',
    features: [
      'Up to 10 alerts',
      '10,000 API requests/hour',
      'Email notifications',
      'Basic support',
    ],
    limits: {
      alerts: 10,
      apiRequestsPerHour: 10000,
    },
  },
  team: {
    name: 'Team',
    description: 'Ideal for organizations and teams',
    price: 29,
    currency: 'eur',
    interval: 'month',
    features: [
      'Up to 50 alerts',
      '50,000 API requests/hour',
      'Email & Slack notifications',
      'Priority support',
      'Team management',
    ],
    limits: {
      alerts: 50,
      apiRequestsPerHour: 50000,
    },
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    price: 99,
    currency: 'eur',
    interval: 'month',
    features: [
      'Unlimited alerts',
      '100,000 API requests/hour',
      'All notification channels',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    limits: {
      alerts: -1, // Unlimited
      apiRequestsPerHour: 100000,
    },
  },
} as const;

export type PlanType = keyof typeof PRICING_PLANS;

// Create Stripe checkout session
export async function createCheckoutSession(
  userId: string,
  planType: PlanType,
  successUrl: string,
  cancelUrl: string
) {
  const plan = PRICING_PLANS[planType];
  const stripe = getStripe();
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: plan.currency,
          product_data: {
            name: `${plan.name} Plan`,
            description: plan.description,
          },
          unit_amount: plan.price * 100, // Convert to cents
          recurring: {
            interval: plan.interval as 'month' | 'year',
          },
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    metadata: {
      planType,
      userId,
    },
  });

  return session;
}

// Create Stripe customer portal session
export async function createPortalSession(customerId: string, returnUrl: string) {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  const stripe = getStripe();
  return await stripe.subscriptions.retrieve(subscriptionId);
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripe();
  return await stripe.subscriptions.cancel(subscriptionId);
}

// Update subscription
export async function updateSubscription(
  subscriptionId: string,
  newPlanType: PlanType
) {
  const plan = PRICING_PLANS[newPlanType];
  const stripe = getStripe();
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [{
      price_data: {
        currency: plan.currency,
        product_data: {
          name: `${plan.name} Plan`,
          description: plan.description,
        },
        unit_amount: plan.price * 100,
        recurring: {
          interval: plan.interval as 'month' | 'year',
        },
      },
    }],
  });
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
) {
  try {
    const stripe = getStripe();
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error}`);
  }
}

