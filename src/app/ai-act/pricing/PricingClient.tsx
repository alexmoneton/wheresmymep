'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/shadcn/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Badge } from '@/components/shadcn/ui/badge';
import { ArrowLeft, Check, Mail, Loader2 } from 'lucide-react';

export function PricingClient() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleStripeCheckout = async (product: string) => {
    setLoading(product);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL received');
        setLoading(null);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(null);
    }
  };

  const plans = [
    {
      name: 'Team',
      price: '€199',
      period: '/mo',
      description: 'Perfect for small teams getting started with AI Act compliance',
      features: [
        '5 users',
        '25 alerts',
        'Weekly CSV exports',
        'Email alerts',
        'Basic support'
      ],
      cta: 'Get started',
      popular: false,
      product: 'team'
    },
    {
      name: 'Business',
      price: '€499',
      period: '/mo',
      description: 'Ideal for growing teams with advanced compliance needs',
      features: [
        '20 users',
        '150 alerts',
        'Slack/Teams/Webhooks integration',
        'API access',
        'Priority support',
        'Custom alert rules'
      ],
      cta: 'Start free trial',
      popular: true,
      product: 'actradar-business'
    },
    {
      name: 'Enterprise',
      price: '€2,000',
      period: '/mo',
      description: 'For large organizations with complex compliance requirements',
      features: [
        '50+ users',
        'Unlimited alerts',
        'SSO integration',
        'Higher rate limits',
        'Audit logs',
        'Uptime SLA',
        'Dedicated support'
      ],
      cta: 'Contact sales',
      popular: false,
      product: 'enterprise'
    }
  ];

  const faqs = [
    {
      question: 'Who is this for?',
      answer: 'Policy, compliance, product, and data teams who can&apos;t afford to miss AI Act changes.'
    },
    {
      question: 'Can we cancel anytime?',
      answer: 'Yes—self-serve. You can also pause if you&apos;re not using it.'
    },
    {
      question: 'Privacy?',
      answer: 'We don&apos;t build user profiles. Alerts are minimal and easy to turn off.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/ai-act" className="text-purple-600 hover:text-purple-800 flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Act Radar</span>
          </Link>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Act Radar Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the right plan for your team to stay updated on AI Act changes and compliance requirements.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
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
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => {
                    if (plan.product === 'actradar-business') {
                      handleStripeCheckout(plan.product);
                    } else if (plan.product === 'enterprise') {
                      window.location.href = 'mailto:hello@wheresmymep.eu?subject=AI Act Radar Enterprise Inquiry';
                    }
                  }}
                  disabled={loading === plan.product}
                >
                  {loading === plan.product ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-600 mb-6">
              Contact us to discuss your team&apos;s needs and get a custom quote.
            </p>
            <Button 
              size="lg" 
              className="flex items-center space-x-2 mx-auto"
              onClick={() => window.location.href = 'mailto:hello@wheresmymep.eu?subject=AI Act Radar Pricing Inquiry'}
            >
              <Mail className="h-5 w-5" />
              <span>Contact us</span>
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}