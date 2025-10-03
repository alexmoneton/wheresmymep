import { Metadata } from 'next';
import Link from 'next/link';
import { fetchLeaderboard, type LeaderboardRow } from '@/lib/meps/leaderboard';
import CountryFlag from '@/components/CountryFlag';
import PartyBadge from '@/components/PartyBadge';
import { LeaderboardSearch } from '@/components/LeaderboardSearch';
import LeaderboardSort from '@/components/LeaderboardSort';

export const revalidate = 43200; // 12 hours

export const metadata: Metadata = {
  title: 'MEP Leaderboard — Where\'s My MEP?',
  description: 'All Members of the European Parliament ranked by attendance over the last 180 days.',
  openGraph: {
    title: 'MEP Leaderboard — Where\'s My MEP?',
    description: 'All Members of the European Parliament ranked by attendance over the last 180 days.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MEP Leaderboard — Where\'s My MEP?',
    description: 'All Members of the European Parliament ranked by attendance over the last 180 days.',
  },
};

interface LeaderboardPageProps {
  searchParams: {
    page?: string;
    q?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const query = resolvedSearchParams.q || '';
  const sortBy = (resolvedSearchParams.sortBy as 'attendance' | 'party' | 'country' | 'name') || 'attendance';
  const sortOrder = (resolvedSearchParams.sortOrder as 'asc' | 'desc') || 'desc';
  const pageSize = 50;

  const { rows, total, totalPages } = await fetchLeaderboard({
    page,
    pageSize,
    q: query,
    sortBy,
    sortOrder,
  });

  const startRank = (page - 1) * pageSize + 1;

  // Generate JSON-LD for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'MEP Leaderboard',
    description: 'Members of the European Parliament ranked by attendance',
    numberOfItems: total,
    itemListElement: rows.map((mep, index) => ({
      '@type': 'ListItem',
      position: startRank + index,
      item: {
        '@type': 'Person',
        name: mep.name,
        jobTitle: 'Member of the European Parliament',
        worksFor: {
          '@type': 'Organization',
          name: 'European Parliament',
        },
        address: {
          '@type': 'PostalAddress',
          addressCountry: mep.countryCode,
        },
        additionalProperty: {
          '@type': 'PropertyValue',
          name: 'Attendance Percentage',
          value: mep.attendancePct,
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              MEP Leaderboard
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Attendance in roll-call votes, last 180 days
            </p>
            
            {/* Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="max-w-md">
                <LeaderboardSearch defaultValue={query} />
              </div>
              
              {/* Sort Controls */}
              <LeaderboardSort sortBy={sortBy} sortOrder={sortOrder} />
              
              {/* Download CSV Button */}
              <a
                href="/api/attendance/export"
                download
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                📥 Download CSV
              </a>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {query ? (
                <>
                  Showing {rows.length} of {total} MEPs matching "{query}"
                </>
              ) : (
                <>
                  Showing {rows.length} of {total} MEPs
                </>
              )}
            </p>
          </div>

          {/* Table */}
          <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Votes Cast
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Votes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((mep, index) => (
                    <tr key={mep.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {startRank + index}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/mep/${mep.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {mep.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CountryFlag country={mep.country} className="mr-2" />
                          <span className="text-sm text-gray-900">{mep.country}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {mep.party && <PartyBadge party={mep.party} />}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {mep.attendancePct.toFixed(1)}%
                          </span>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                mep.attendancePct >= 90
                                  ? 'bg-green-500'
                                  : mep.attendancePct >= 80
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${mep.attendancePct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mep.votesCast?.toLocaleString() || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mep.totalVotes?.toLocaleString() || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </div>
              <div className="flex space-x-2">
                {page > 1 && (
                  <Link
                    href={`/leaderboard?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ''}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/leaderboard?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ''}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}