import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Force immediate revalidation

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Where\'s My MEP? - European Parliament Attendance Tracker',
    description: 'Track attendance rates and voting records of Members of the European Parliament. Monitor MEP performance, committee work, and policy positions with comprehensive data and insights.',
  };
}

export default async function HomePage() {
  // Temporarily simplified to isolate the issue
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Where's My MEP?
            </h1>
            <p className="text-lg text-gray-600">
              Track attendance rates and voting records of Members of the European Parliament
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Site Status</h2>
          <p className="text-gray-700">
            The site is currently being updated. Database has been populated with 638 MEPs and attendance data.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toISOString()}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">638</div>
            <div className="text-sm text-gray-600">Active MEPs</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">1,215</div>
            <div className="text-sm text-gray-600">Roll-Call Votes</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">27</div>
            <div className="text-sm text-gray-600">EU Countries</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">8</div>
            <div className="text-sm text-gray-600">Political Groups</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/meps" className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-semibold">Browse All MEPs</h3>
              <p className="text-sm text-gray-600">Search and filter MEPs</p>
            </a>
            <a href="/committees" className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-semibold">Committees</h3>
              <p className="text-sm text-gray-600">Explore parliamentary committees</p>
            </a>
            <a href="/votes" className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-semibold">Recent Votes</h3>
              <p className="text-sm text-gray-600">View latest roll-call votes</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}