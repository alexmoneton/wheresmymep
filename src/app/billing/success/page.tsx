import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { Button } from '@/components/shadcn/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card'
import { CheckCircle, ArrowRight, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Payment Successful — EU Act Radar Pro',
  description: 'Your EU Act Radar Pro subscription is now active.',
}

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  })
}

interface BillingSuccessPageProps {
  searchParams: {
    session_id?: string
    product?: string
  }
}

export default async function BillingSuccessPage({ searchParams }: BillingSuccessPageProps) {
  const { session_id, product } = searchParams

  if (!session_id || !product) {
    redirect('/ai-act/pricing')
  }

  try {
    // Verify the session with Stripe
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status !== 'paid') {
      redirect('/ai-act/pricing?error=payment_not_completed')
    }

    // Set the pro_ear cookie
    const cookieStore = cookies()
    cookieStore.set('pro_ear', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 31536000, // 1 year
      path: '/',
    })

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Payment Successful!
              </CardTitle>
              <CardDescription className="text-lg">
                You're now a EU Act Radar Pro subscriber
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Pro features activated:</strong>
                </p>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Unlimited AI Act alerts</li>
                  <li>• Unlimited CSV exports</li>
                  <li>• Weekly digests</li>
                  <li>• Priority support</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/ai-act">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Go to EU Act Radar
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/ai-act/what-changed">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Recent Changes
                  </Link>
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                <p>
                  Session ID: {session_id.substring(0, 20)}...
                </p>
                <p>
                  Product: {product}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error verifying Stripe session:', error)
    redirect('/ai-act/pricing?error=verification_failed')
  }
}
