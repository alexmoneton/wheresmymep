'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MEP, Country, Party } from '@prisma/client';

interface HomePageClientProps {
  topMEPs: (MEP & {
    country: Country;
    party: Party | null;
  })[];
  bottomMEPs: (MEP & {
    country: Country;
    party: Party | null;
  })[];
  stats: {
    mepCount: number;
    voteCount: number;
    countryCount: number;
    partyCount: number;
  };
}

export default function HomePageClient({ topMEPs, bottomMEPs, stats }: HomePageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Where's My MEP?
            </h1>
            <p className="text-lg text-gray-600">
              Attendance in roll-call votes, last 180 days.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 pr-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              <Link
                href={`/meps?q=${encodeURIComponent(searchQuery)}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </Link>
              <Link
                href="/meps"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                View All
              </Link>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top 10 Attendance */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="text-green-600 mr-2">🏆</span>
                Top 10 Attendance
              </h2>
              <p className="text-sm text-gray-600 mt-1">Highest attendance rates.</p>
            </div>
            <div className="divide-y divide-gray-100">
              {topMEPs.map((mep, index) => {
                const fullName = `${mep.firstName} ${mep.lastName}`;
                const slug = fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                
                // Country flag mapping
                const countryFlags: Record<string, string> = {
                  'Austria': '🇦🇹',
                  'Belgium': '🇧🇪',
                  'Bulgaria': '🇧🇬',
                  'Croatia': '🇭🇷',
                  'Cyprus': '🇨🇾',
                  'Czechia': '🇨🇿',
                  'Czech Republic': '🇨🇿',
                  'Denmark': '🇩🇰',
                  'Estonia': '🇪🇪',
                  'Finland': '🇫🇮',
                  'France': '🇫🇷',
                  'Germany': '🇩🇪',
                  'Greece': '🇬🇷',
                  'Hungary': '🇭🇺',
                  'Ireland': '🇮🇪',
                  'Italy': '🇮🇹',
                  'Latvia': '🇱🇻',
                  'Lithuania': '🇱🇹',
                  'Luxembourg': '🇱🇺',
                  'Malta': '🇲🇹',
                  'Netherlands': '🇳🇱',
                  'Poland': '🇵🇱',
                  'Portugal': '🇵🇹',
                  'Romania': '🇷🇴',
                  'Slovakia': '🇸🇰',
                  'Slovenia': '🇸🇮',
                  'Spain': '🇪🇸',
                  'Sweden': '🇸🇪',
                };
                
                const flag = countryFlags[mep.country.name] || '🇪🇺';
                
                return (
                  <div key={mep.id} className="px-6 py-5 hover:bg-green-50 border-l-4 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-800">{index + 1}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{flag}</span>
                          <div>
                            <Link 
                              href={`/meps/${slug}`}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600"
                            >
                              {fullName}
                            </Link>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {mep.country.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {mep.party?.abbreviation || 'Independent'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          {mep.attendancePct ? `${mep.attendancePct}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {mep.votesCast && mep.votesTotal ? `${mep.votesCast}/${mep.votesTotal} votes` : 'Data loading...'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-gray-200">
              <Link 
                href="/rankings/attendance"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View full attendance rankings →
              </Link>
            </div>
          </div>

          {/* Bottom 10 Attendance */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="text-red-600 mr-2">⚠️</span>
                Bottom 10 Attendance
              </h2>
              <p className="text-sm text-gray-600 mt-1">Lowest attendance rates.</p>
            </div>
            <div className="divide-y divide-gray-100">
              {bottomMEPs.map((mep, index) => {
                const fullName = `${mep.firstName} ${mep.lastName}`;
                const slug = fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                
                // Country flag mapping
                const countryFlags: Record<string, string> = {
                  'Austria': '🇦🇹',
                  'Belgium': '🇧🇪',
                  'Bulgaria': '🇧🇬',
                  'Croatia': '🇭🇷',
                  'Cyprus': '🇨🇾',
                  'Czechia': '🇨🇿',
                  'Czech Republic': '🇨🇿',
                  'Denmark': '🇩🇰',
                  'Estonia': '🇪🇪',
                  'Finland': '🇫🇮',
                  'France': '🇫🇷',
                  'Germany': '🇩🇪',
                  'Greece': '🇬🇷',
                  'Hungary': '🇭🇺',
                  'Ireland': '🇮🇪',
                  'Italy': '🇮🇹',
                  'Latvia': '🇱🇻',
                  'Lithuania': '🇱🇹',
                  'Luxembourg': '🇱🇺',
                  'Malta': '🇲🇹',
                  'Netherlands': '🇳🇱',
                  'Poland': '🇵🇱',
                  'Portugal': '🇵🇹',
                  'Romania': '🇷🇴',
                  'Slovakia': '🇸🇰',
                  'Slovenia': '🇸🇮',
                  'Spain': '🇪🇸',
                  'Sweden': '🇸🇪',
                };
                
                const flag = countryFlags[mep.country.name] || '🇪🇺';
                
                return (
                  <div key={mep.id} className="px-6 py-5 hover:bg-red-50 border-l-4 border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-red-800">{index + 1}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{flag}</span>
                          <div>
                            <Link 
                              href={`/meps/${slug}`}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600"
                            >
                              {fullName}
                            </Link>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {mep.country.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {mep.party?.abbreviation || 'Independent'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-600">
                          {mep.attendancePct ? `${mep.attendancePct}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {mep.votesCast && mep.votesTotal ? `${mep.votesCast}/${mep.votesTotal} votes` : 'Data loading...'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-3 bg-gradient-to-r from-red-50 to-pink-50 border-t border-gray-200">
              <Link 
                href="/rankings/attendance"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View full attendance rankings →
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
