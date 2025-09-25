'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

const plans = [
  {
    name: 'Individual',
    price: '€49',
    period: 'month',
    description: 'Perfect for journalists, researchers, and engaged citizens',
    features: [
      'Unlimited MEP profiles',
      'Advanced search and filtering',
      'CSV export of data',
      'Email alerts (up to 5)',
      'Priority support',
      'API access (1,000 requests/month)',
    ],
    limitations: [
      'Limited to 5 email alerts',
      'Basic API rate limits',
    ],
    popular: false,
    cta: 'Start Free Trial',
  },
  {
    name: 'Team',
    price: '€149',
    period: 'month',
    description: 'Ideal for newsrooms, NGOs, and research teams',
    features: [
      'Everything in Individual',
      '3 team seats included',
      'Unlimited email alerts',
      'Slack webhook integration',
      'Advanced API access (10,000 requests/month)',
      'Custom data exports',
      'Team dashboard',
      'Priority support',
    ],
    limitations: [
      'Limited to 3 team seats',
      'Standard API rate limits',
    ],
    popular: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Organization',
    price: '€299',
    period: 'month',
    description: 'For large organizations and commercial use',
    features: [
      'Everything in Team',
      '10 team seats included',
      'Unlimited API access',
      'Custom webhook integrations',
      'White-label options',
      'Custom data processing',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    limitations: [],
    popular: false,
    cta: 'Contact Sales',
  },
];

const freeFeatures = [
  'Basic MEP profiles',
  'Attendance tracking',
  'Recent votes',
  'Committee information',
  'Basic search',
];

const proFeatures = [
  'Advanced analytics',
  'Historical data access',
  'Custom alerts',
  'API access',
  'Data exports',
  'Priority support',
];

export default function PricingClientPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Pricing
            </h1>
            <p className="text-lg text-gray-600">
              Choose the right plan for your needs
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Free vs Pro Comparison */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Free vs Pro Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Free Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {freeFeatures.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Pro Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {proFeatures.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-4xl font-bold">
                  {plan.price}
                  <span className="text-lg font-normal text-gray-600">/{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <li key={limitation} className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-500">{limitation}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's included in the free plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  The free plan includes access to basic MEP profiles, attendance tracking, recent votes, 
                  committee information, and basic search functionality. Perfect for casual users and 
                  citizens who want to track their representatives.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does the API work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our API provides programmatic access to MEP data, voting records, and attendance information. 
                  Different plans include different rate limits and features. Check the plan details above 
                  for specific API access levels.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                  and we'll prorate any billing differences. Contact support if you need help with plan changes.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, all paid plans include a 14-day free trial. You can explore all pro features 
                  without any commitment. No credit card required to start your trial.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <Card className="text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
            <p className="text-gray-600 mb-6">
              We offer custom enterprise solutions for large organizations with specific needs. 
              Contact us to discuss your requirements.
            </p>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
