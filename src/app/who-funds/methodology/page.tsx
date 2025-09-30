import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, ExternalLink, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card';

export const metadata: Metadata = {
  title: 'Methodology — WhoFundsMyMEP | Where\'s My MEP?',
  description: 'How we parse and structure Declarations of Members\' Financial/Private Interests from official sources.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/who-funds" className="text-blue-600 hover:text-blue-800 flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to WhoFundsMyMEP</span>
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Methodology
          </h1>
          <p className="text-lg text-gray-600">
            How we parse and structure Declarations of Members' Financial/Private Interests
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Data Sources</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Primary Sources</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>
                      • <strong>European Parliament MEPs Directory:</strong>{' '}
                      <a href="https://www.europarl.europa.eu/meps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        europarl.europa.eu/meps
                      </a>
                    </li>
                    <li>
                      • <strong>Transparency Register:</strong>{' '}
                      <a href="https://transparency-register.europa.eu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        transparency-register.europa.eu
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Declaration Types</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Declarations of Financial Interests</li>
                    <li>• Declarations of Private Interests</li>
                    <li>• Outside Activities and Remunerations</li>
                    <li>• Support and Sponsorship</li>
                    <li>• Shareholdings and Investments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Processing */}
          <Card>
            <CardHeader>
              <CardTitle>Data Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Extraction Process</h3>
                  <ol className="space-y-2 text-gray-600 list-decimal list-inside">
                    <li>Download official PDF declarations from European Parliament sources</li>
                    <li>Parse structured data using automated text extraction</li>
                    <li>Categorize information into standardized fields:
                      <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                        <li>Outside activities (paid/unpaid)</li>
                        <li>Income bands and remuneration</li>
                        <li>Support received (financial, staff, material)</li>
                        <li>Shareholdings and investments</li>
                        <li>Advisory roles and board positions</li>
                      </ul>
                    </li>
                    <li>Link to original PDF sources for verification</li>
                  </ol>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Data Structure</h3>
                  <p className="text-gray-600">
                    Each MEP's data includes last updated date, categorized activities, 
                    support received, holdings, and notes about data limitations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitations & Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>Limitations & Disclaimers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Important Notes</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <strong>Preview Data:</strong> Current implementation uses sample data for demonstration</li>
                    <li>• <strong>Official Source:</strong> Always refer to original PDF declarations for authoritative information</li>
                    <li>• <strong>Update Frequency:</strong> Data may not reflect the most recent declarations</li>
                    <li>• <strong>Parsing Limitations:</strong> Automated extraction may miss nuances or context</li>
                    <li>• <strong>Completeness:</strong> Not all MEPs may have complete or up-to-date declarations</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Data Quality</h3>
                  <p className="text-gray-600">
                    We strive for accuracy but cannot guarantee completeness or error-free parsing. 
                    Users should verify important information against official sources.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Future Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Future Development</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Planned Features</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Real-time data updates from official sources</li>
                    <li>• Enhanced parsing accuracy with manual verification</li>
                    <li>• Historical tracking of declaration changes</li>
                    <li>• Advanced search and filtering capabilities</li>
                    <li>• API access for researchers and journalists</li>
                    <li>• Integration with other transparency tools</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Feedback</h3>
                  <p className="text-gray-600">
                    We welcome feedback on data accuracy, missing information, or suggestions for improvement. 
                    Contact us at{' '}
                    <a href="mailto:hello@wheresmymep.eu" className="text-blue-600 hover:text-blue-800">
                      hello@wheresmymep.eu
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              This methodology is subject to change as we improve our data processing capabilities.
            </p>
            <div className="mt-4">
              <Link href="/who-funds">
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  ← Back to WhoFundsMyMEP
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
