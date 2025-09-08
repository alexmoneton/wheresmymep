import Link from 'next/link';
import { getLeaderboardTop, getLeaderboardBottom } from '@/lib/data';
import CountryFlag from '@/components/CountryFlag';
import PartyBadge from '@/components/PartyBadge';

export default function HomePage() {
  const topMEPs = getLeaderboardTop(10);
  const bottomMEPs = getLeaderboardBottom(10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Where&apos;s My MEP?
            </h1>
            <p className="text-lg text-gray-600">
              Attendance in roll-call votes, last 180 days
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Search MEPs
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name or country..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Link
              href="/leaderboard"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View Full Leaderboard
            </Link>
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top 10 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Top 10 Attendance
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Highest attendance rates
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {topMEPs.map((mep, index) => (
                  <div
                    key={mep.mep_id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {index + 1}
                      </span>
                      <CountryFlag country={mep.country} className="text-lg" />
                      <div>
                        <Link
                          href={`/mep/${mep.mep_id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {mep.name}
                        </Link>
                        <p className="text-sm text-gray-600">{mep.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        {mep.attendance_pct}%
                      </div>
                      <PartyBadge party={mep.party} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom 10 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Bottom 10 Attendance
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Lowest attendance rates
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {bottomMEPs.map((mep, index) => (
                  <div
                    key={mep.mep_id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {index + 1}
                      </span>
                      <CountryFlag country={mep.country} className="text-lg" />
                      <div>
                        <Link
                          href={`/mep/${mep.mep_id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {mep.name}
                        </Link>
                        <p className="text-sm text-gray-600">{mep.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-red-600">
                        {mep.attendance_pct}%
                      </div>
                      <PartyBadge party={mep.party} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Methodology */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Methodology
          </h3>
          <p className="text-sm text-blue-800">
            Attendance is calculated based on roll-call votes in the European Parliament over the last 180 days. 
            Abstaining counts as present; not voting counts as absent. Some MEPs may have partial terms 
            affecting their attendance percentage.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>
              Data source: HowTheyVote.eu • European Parliament roll-call votes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}