import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RankingPageProps {
  params: { metric: string };
}

export const revalidate = 43200; // 12 hours

async function getRankingData(metric: string) {
  try {
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

    if (!validMetrics.includes(metric)) {
      return null;
    }

    // Get MEPs with attendance data (use the attendancePct field directly)
    const meps = await prisma.mEP.findMany({
      where: { 
        active: true,
        attendancePct: { not: null }
      },
      include: {
        country: true,
        party: true,
      },
      orderBy: { attendancePct: 'desc' },
      take: 50, // Limit for now
    });

    console.log(`Found ${meps.length} MEPs for rankings`);

    // Add position
    const rankedMEPs = meps.map((mep, index) => ({
      ...mep,
      position: index + 1,
    }));

    return {
      metric,
      meps: rankedMEPs,
      totalMEPs: rankedMEPs.length,
    };
  } catch (error) {
    console.error('Error fetching ranking data:', error);
    return null;
  }
}

export async function generateMetadata({ params }: RankingPageProps): Promise<Metadata> {
  const title = `${params.metric.charAt(0).toUpperCase() + params.metric.slice(1).replace('-', ' ')} Rankings | Where's My MEP?`;
  const description = `View MEP rankings by ${params.metric.replace('-', ' ')}. Track performance and activity levels of Members of the European Parliament.`;

  return {
    title,
    description,
  };
}

export default async function RankingPage({ params }: RankingPageProps) {
  const rankingData = await getRankingData(params.metric);
  
  if (!rankingData) {
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rankings</h2>
          <p className="text-gray-700 mb-4">
            Found {rankingData.meps.length} MEPs with attendance data.
          </p>
          
          {rankingData.meps.length > 0 ? (
            <div className="space-y-4">
              {rankingData.meps.map((mep) => (
                <div key={mep.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-800">
                        {mep.position}
                      </span>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-600">
                        {mep.firstName[0]}{mep.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {mep.firstName} {mep.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {mep.country.name} • {mep.party?.name || 'Independent'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {mep.attendancePct}%
                    </div>
                    <div className="text-sm text-gray-500">
                      attendance
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No MEPs found with attendance data.</p>
              <p className="text-sm text-gray-400 mt-2">
                This might indicate a database connection issue.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h3>
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
