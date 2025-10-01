import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, ExternalLink, AlertTriangle, Calendar, Database } from 'lucide-react';
import { ENV_DEFAULTS } from '@/lib/flags';

export const metadata: Metadata = {
  title: 'WhoFundsMyMEP Methodology — How We Track MEP Financial Interests | Where\'s My MEP?',
  description: 'Learn how we parse and track MEP declarations of financial interests, our data sources, parsing methods, limitations, and update cadence.',
  keywords: ['MEP methodology', 'financial interests', 'data sources', 'parsing', 'transparency', 'European Parliament'],
  openGraph: {
    title: 'WhoFundsMyMEP Methodology — How We Track MEP Financial Interests',
    description: 'Learn how we parse and track MEP declarations of financial interests, our data sources, parsing methods, limitations, and update cadence.',
    type: 'article',
    url: 'https://wheresmymep.eu/who-funds/methodology',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MethodologyPage() {
  // Feature flag guard
  if (!ENV_DEFAULTS.whofunds) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/who-funds"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to WhoFundsMyMEP
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Methodology
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            How we track and parse MEP declarations of financial interests
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          
          {/* Data Sources */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Database className="h-6 w-6 mr-2" />
              Data Sources
            </h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-gray-700 mb-4">
                We source all data from official European Parliament declarations of financial interests:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    <strong>Official MEP Profiles:</strong> Individual MEP profile pages on europarl.europa.eu
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    <strong>Declaration PDFs:</strong> Official "Declaration of Members' Financial/Private Interests" documents
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    <strong>Transparency Register:</strong> EU Transparency Register entries (when available)
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Parsing Methods */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              Parsing Methods
            </h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">HTML Table Parsing</h3>
                  <p className="text-gray-700">
                    For structured HTML declarations, we parse tables and extract:
                  </p>
                  <ul className="mt-2 space-y-1 text-gray-600">
                    <li>• Entity names and types</li>
                    <li>• Income amounts and periods</li>
                    <li>• Roles and positions</li>
                    <li>• Dates and timeframes</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Text Extraction</h3>
                  <p className="text-gray-700">
                    For PDF declarations, we use text extraction and pattern recognition to identify:
                  </p>
                  <ul className="mt-2 space-y-1 text-gray-600">
                    <li>• Structured data blocks</li>
                    <li>• Financial amounts and currencies</li>
                    <li>• Organization names and relationships</li>
                    <li>• Time periods and dates</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Quality Assessment</h3>
                  <p className="text-gray-700">
                    Each parsed entry receives a confidence score:
                  </p>
                  <ul className="mt-2 space-y-1 text-gray-600">
                    <li>• <strong>High:</strong> Clear structured data, complete information</li>
                    <li>• <strong>Medium:</strong> Some ambiguity or missing details</li>
                    <li>• <strong>Low:</strong> Significant parsing issues or incomplete data</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Update Cadence */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              Update Cadence
            </h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Automated Refresh</h3>
                  <p className="text-gray-700">
                    Our system automatically checks for updates:
                  </p>
                  <ul className="mt-2 space-y-1 text-gray-600">
                    <li>• <strong>Daily:</strong> Check for new or updated declarations</li>
                    <li>• <strong>Monthly:</strong> Full refresh of all MEP data</li>
                    <li>• <strong>On-demand:</strong> Manual refresh when issues are reported</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Detection</h3>
                  <p className="text-gray-700">
                    We track and notify users of:
                  </p>
                  <ul className="mt-2 space-y-1 text-gray-600">
                    <li>• New income sources or positions</li>
                    <li>• Changes in existing declarations</li>
                    <li>• Updated amounts or timeframes</li>
                    <li>• New gifts or travel sponsorships</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Limitations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Limitations & Disclaimers
            </h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">Data Accuracy</h3>
                  <p className="text-orange-800">
                    While we strive for accuracy, our automated parsing may miss or misinterpret some information. 
                    Always refer to the official declarations for authoritative data.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">Coverage</h3>
                  <p className="text-orange-800">
                    Not all MEPs may have complete or up-to-date declarations available. 
                    Some declarations may be in formats we cannot parse effectively.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">Interpretation</h3>
                  <p className="text-orange-800">
                    We present the data as found in official declarations. 
                    We do not make judgments about the appropriateness or legality of any financial interests.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Correction Path */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reporting Issues</h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-gray-700 mb-4">
                If you find errors or have concerns about our data:
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-gray-700">
                      <strong>GitHub Issues:</strong> Report parsing errors or data issues on our GitHub repository
                    </p>
                    <a 
                      href="https://github.com/alexmoneton/wheresmymep/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Open an issue →
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-gray-700">
                      <strong>Email:</strong> Contact us directly for urgent corrections
                    </p>
                    <a 
                      href="mailto:alex@moneton.no"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      alex@moneton.no →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Back to WhoFunds */}
          <div className="text-center pt-8">
            <Link 
              href="/who-funds"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to WhoFundsMyMEP
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}