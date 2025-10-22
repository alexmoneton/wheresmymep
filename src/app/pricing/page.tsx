import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/shadcn/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';
import { ArrowLeft, Check, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing | Where\'s My MEP?',
  description: 'Choose the perfect plan for tracking European Parliament attendance and voting records.',
};

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '€0',
      period: 'forever',
      description: 'Perfect for casual users and transparency advocates',
      features: [
        '3 alerts per month',
        '3 CSV exports per month',
        'Basic MEP search',
        'Attendance tracking',
        'Voting records',
        'Community support'
      ],
      cta: 'Current Plan',
      ctaVariant: 'outline' as const,
      popular: false
    },
    {
      name: 'Pro',
      price: '€29',
      period: 'month',
      description: 'For researchers, journalists, and policy professionals',
      features: [
        'Unlimited alerts',
        'Unlimited CSV exports',
        'Advanced filtering',
        'Weekly digest emails',
        'Priority support',
        'API access',
        'Custom notifications',
        'Historical data access'
      ],
      cta: 'Coming Soon',
      ctaVariant: 'default' as const,
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Where&apos;s My MEP?
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include access to our comprehensive 
            European Parliament data and attendance tracking.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">/{plan.period}</span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={plan.ctaVariant}
                  disabled={plan.name === 'Pro'}
                >
                  {plan.name === 'Pro' ? (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      {plan.cta}
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-sm border p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Questions about pricing?
            </h3>
            <p className="text-gray-600 mb-6">
              We&apos;re here to help you choose the right plan for your needs. 
              Contact us for custom solutions or enterprise pricing.
            </p>
            <Button variant="outline" asChild>
              <a href="mailto:alex@moneton.no">
                <Mail className="h-4 w-4 mr-2" />
                Contact Us
              </a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}


