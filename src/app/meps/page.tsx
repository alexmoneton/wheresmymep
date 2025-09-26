import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 43200; // 12 hours

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'All MEPs - European Parliament Members | Where\'s My MEP?',
    description: 'Browse all Members of the European Parliament. Filter by country, party, committee, and track attendance rates and voting records.',
  };
}

export default async function MEPsPage() {
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
            The MEP directory is currently being updated with the latest data. We have 638 active MEPs from 27 EU countries across 8 political groups.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">638</div>
              <div className="text-sm text-gray-600">Active MEPs</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">27</div>
              <div className="text-sm text-gray-600">EU Countries</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-sm text-gray-600">Political Groups</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">1,215</div>
              <div className="text-sm text-gray-600">Roll-Call Votes</div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Last updated: {new Date().toISOString()}
          </div>
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
