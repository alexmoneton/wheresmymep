'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/shadcn/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { CreateAlertModal } from '@/components/CreateAlertModal';
import { Bell, ArrowRight, Shield, FileText, Gavel, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/shadcn/ui/badge';

export function AIActIndexClient() {
  const pathname = usePathname();
  
  const getPricingHref = () => {
    return pathname.startsWith('/ai-act') ? '/ai-act/pricing' : '/pricing';
  };
  
  const isPSEOEnabled = process.env.NEXT_PUBLIC_PSEO_ENABLE === 'true';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Where&apos;s My MEP?
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/ai-act" className="text-gray-900 font-medium">
                EU Act Radar
              </Link>
              <Link href="/ai-act/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link
                href={getPricingHref()}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Free
              </Link>
              {!isPSEOEnabled && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  pSEO (off)
                </Badge>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              EU Act Radar — don&apos;t miss AI Act updates
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A simple way to get alerts when the AI Act moves: new guidance, delegated acts, and duties that matter to you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <CreateAlertModal prefilledTopic="AI Act weekly changes">
                <Button size="lg" className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Set an alert</span>
                </Button>
              </CreateAlertModal>
              
              <Link href="/ai-act/what-changed">
                <Button variant="outline" size="lg" className="flex items-center space-x-2">
                  <span>What changed this week</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              EU Act Radar — by wheresmymep.eu
            </div>
          </div>
        </div>
      </div>

      {/* Topic Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Track what matters to you
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your focus areas and get notified when relevant AI Act updates are published.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Obligations */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Obligations</CardTitle>
              </div>
              <CardDescription>
                Track provider duties, transparency requirements, and compliance obligations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Topics covered:</strong> Risk management, transparency, dataset governance
                </div>
                <Link href="/ai-act/topics/risk-management">
                  <Button variant="outline" className="w-full">
                    View Risk Management →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Guidance & Delegated Acts */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Guidance & Delegated Acts</CardTitle>
              </div>
              <CardDescription>
                Stay updated on new guidance documents and delegated acts from the EU
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Topics covered:</strong> Logging, dataset governance, post-market monitoring
                </div>
                <Link href="/ai-act/topics/dataset-governance">
                  <Button variant="outline" className="w-full">
                    View Dataset Governance →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Enforcement Actions */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Gavel className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Enforcement Actions</CardTitle>
              </div>
              <CardDescription>
                Monitor enforcement activities and post-market monitoring requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Topics covered:</strong> Post-market monitoring, incident reporting
                </div>
                <Link href="/ai-act/topics/post-market-monitoring">
                  <Button variant="outline" className="w-full">
                    View Post-Market Monitoring →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Topics */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            All Topics
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link href="/ai-act/topics/logging">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="font-medium text-gray-900">Logging & Traceability</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/ai-act/topics/dataset-governance">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="font-medium text-gray-900">Dataset Governance</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/ai-act/topics/post-market-monitoring">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="font-medium text-gray-900">Post-Market Monitoring</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/ai-act/topics/transparency">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="font-medium text-gray-900">Transparency & User Info</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/ai-act/topics/risk-management">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="font-medium text-gray-900">Risk Management</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to stay informed?
            </h3>
            <p className="text-gray-600 mb-6">
              Set up alerts for the topics that matter to your team and never miss an important update.
            </p>
            <CreateAlertModal prefilledTopic="AI Act weekly changes">
              <Button size="lg" className="flex items-center space-x-2 mx-auto">
                <Bell className="h-5 w-5" />
                <span>Set up alerts now</span>
              </Button>
            </CreateAlertModal>
          </div>
        </div>
      </div>
    </div>
  );
}