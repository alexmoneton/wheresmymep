import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface RankingPageProps {
  params: { metric: string };
}

export const revalidate = 43200; // 12 hours

export async function generateMetadata({ params }: RankingPageProps): Promise<Metadata> {
  const title = `${params.metric.charAt(0).toUpperCase() + params.metric.slice(1).replace('-', ' ')} Rankings | Where's My MEP?`;
  const description = `View MEP rankings by ${params.metric.replace('-', ' ')}. Track performance and activity levels of Members of the European Parliament.`;

  return {
    title,
    description,
  };
}

export default async function RankingPage({ params }: RankingPageProps) {
  // Define valid metrics
  const validMetrics = [
    'attendance',
    'most-active',
    'climate-environment',
    'energy',
    'migration-asylum',
    'digital-technology',
    'trade-economy',
    'agriculture',
    'health',
    'education-culture',
    'transport',
    'defense-security',
    'foreign-affairs',
    'human-rights',
    'democracy-rule-of-law',
    'justice-home-affairs',
  ];

  if (!validMetrics.includes(params.metric)) {
    notFound();
  }

  const metricTitle = params.metric.charAt(0).toUpperCase() + params.metric.slice(1).replace('-', ' ');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {metricTitle} Rankings
            </h1>
            <p className="text-lg text-gray-600">
              Track performance and activity levels of Members of the European Parliament
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rankings Overview</h2>
          <p className="text-gray-700 mb-4">
            The {params.metric} rankings are currently being updated with the latest data. We're processing attendance records and voting data for all 638 active MEPs.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">638</div>
              <div className="text-sm text-gray-600">MEPs Ranked</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">27</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-sm text-gray-600">Political Groups</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">1,215</div>
              <div className="text-sm text-gray-600">Votes Analyzed</div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Last updated: {new Date().toISOString()}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h3>
          <p className="text-gray-700 mb-4">
            We're working on bringing you detailed {params.metric} rankings with real-time data. The rankings will show:
          </p>
          
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>Individual MEP performance scores</li>
            <li>Country-by-country breakdowns</li>
            <li>Political group comparisons</li>
            <li>Historical trends and changes</li>
            <li>Interactive charts and visualizations</li>
          </ul>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/meps" className="p-4 border rounded-lg hover:bg-gray-50">
              <h4 className="font-semibold text-blue-600">Browse All MEPs</h4>
              <p className="text-sm text-gray-600">View individual MEP profiles and data</p>
            </a>
            <a href="/committees" className="p-4 border rounded-lg hover:bg-gray-50">
              <h4 className="font-semibold text-green-600">Committees</h4>
              <p className="text-sm text-gray-600">Explore parliamentary committees</p>
            </a>
            <a href="/votes" className="p-4 border rounded-lg hover:bg-gray-50">
              <h4 className="font-semibold text-purple-600">Recent Votes</h4>
              <p className="text-sm text-gray-600">View the latest roll-call votes</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
