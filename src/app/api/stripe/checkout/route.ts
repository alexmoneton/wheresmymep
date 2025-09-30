import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product, email } = body

    if (!product) {
      return NextResponse.json({ error: 'Product is required' }, { status: 400 })
    }

    // Validate product
    if (product !== 'actradar-business') {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
    }

    // Get price ID from environment
    const priceId = process.env.STRIPE_PRICE_ACTRADAR_BUSINESS
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 })
    }

    // Get app URL
    const appUrl = process.env.APP_URL || 'http://localhost:3000'

    // Create checkout session
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}&product=${product}`,
      cancel_url: `${appUrl}/ai-act/pricing`,
      allow_promotion_codes: true,
      customer_email: email || undefined,
      metadata: {
        product,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
