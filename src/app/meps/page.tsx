import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 43200; // 12 hours

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'All MEPs - European Parliament Members | Where\'s My MEP?',
    description: 'Browse all Members of the European Parliament. Filter by country, party, committee, and track attendance rates and voting records.',
  };
}

async function getMEPs() {
  try {
    const meps = await prisma.mEP.findMany({
      where: { active: true },
      include: {
        country: true,
        party: true,
      },
      orderBy: [
        { country: { name: 'asc' } },
        { lastName: 'asc' },
      ],
      take: 50, // Limit for now
    });
    console.log(`Found ${meps.length} MEPs`);
    return meps;
  } catch (error) {
    console.error('Error fetching MEPs:', error);
    return [];
  }
}

export default async function MEPsPage() {
  const meps = await getMEPs();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              All MEPs
            </h1>
            <p className="text-lg text-gray-600">
              Browse all Members of the European Parliament
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">MEP Directory</h2>
          <p className="text-gray-700 mb-4">
            Found {meps.length} MEPs in the database.
          </p>
          
          {meps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meps.map((mep) => (
                <div key={mep.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-800">
                        {mep.firstName[0]}{mep.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {mep.firstName} {mep.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {mep.country.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {mep.party?.name || 'Independent'}
                      </p>
                      {mep.attendancePct && (
                        <p className="text-sm text-green-600 font-medium">
                          {mep.attendancePct}% attendance
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No MEPs found in the database.</p>
              <p className="text-sm text-gray-400 mt-2">
                This might indicate a database connection issue.
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/rankings/attendance" className="p-4 border rounded-lg hover:bg-gray-50">
              <h4 className="font-semibold text-blue-600">Attendance Rankings</h4>
              <p className="text-sm text-gray-600">See which MEPs have the best attendance records</p>
            </a>
            <a href="/committees" className="p-4 border rounded-lg hover:bg-gray-50">
              <h4 className="font-semibold text-green-600">Committees</h4>
              <p className="text-sm text-gray-600">Explore parliamentary committees and their members</p>
            </a>
            <a href="/votes" className="p-4 border rounded-lg hover:bg-gray-50">
              <h4 className="font-semibold text-purple-600">Recent Votes</h4>
              <p className="text-sm text-gray-600">View the latest roll-call votes in Parliament</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
