'use client';

import Link from 'next/link';
import { MEP, Country, Party, Membership, Committee, MEPVote, Vote } from '@prisma/client';

interface MEPClientPageProps {
  mep: MEP & {
    country: Country;
    party: Party | null;
    memberships: (Membership & {
      committee: Committee;
    })[];
    votes: (MEPVote & {
      vote: Vote;
    })[];
    attendancePct: number;
    votesCast: number;
    votesTotal: number;
  };
  contextualCopy: string;
  committees: Array<{ name: string; role: string }>;
  recentVotes: Array<{ title: string; choice: string; date: string }>;
}

export default function MEPClientPage({ mep, contextualCopy, committees, recentVotes }: MEPClientPageProps) {
  const fullName = `${mep.firstName} ${mep.lastName}`;
  const slug = fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-6">
            {mep.photoUrl && (
              <img
                src={mep.photoUrl}
                alt={fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{fullName}</h1>
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-lg font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  {mep.country.name}
                </span>
                <span className="text-lg text-gray-600">
                  {mep.party?.name || 'Independent'}
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{mep.attendancePct}%</div>
                  <div className="text-sm text-gray-500">Attendance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{mep.votesCast}</div>
                  <div className="text-sm text-gray-500">Votes Cast</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{mep.votesTotal}</div>
                  <div className="text-sm text-gray-500">Total Votes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-blue-600 mr-2">📋</span>
                About
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{contextualCopy}</p>
            </div>

            {/* Committee Memberships */}
            {committees.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-green-600 mr-2">🏛️</span>
                  Committee Memberships
                </h2>
                <div className="space-y-3">
                  {committees.map((committee, index) => (
                    <div key={index} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{committee.name}</span>
                      <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full capitalize">{committee.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Voting History */}
            {recentVotes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-purple-600 mr-2">🗳️</span>
                  Voting History
                </h2>
                <div className="space-y-4">
                  {recentVotes.map((vote, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 text-sm leading-tight">{vote.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-3 ${
                          vote.choice === 'for' ? 'bg-green-100 text-green-800' :
                          vote.choice === 'against' ? 'bg-red-100 text-red-800' :
                          vote.choice === 'abstain' ? 'bg-yellow-100 text-yellow-800' :
                          vote.choice === 'not voting' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {vote.choice === 'not voting' ? 'Not Voting' : vote.choice}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{new Date(vote.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                  ))}
                </div>
                {recentVotes.length >= 50 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">Showing latest 50 votes</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-orange-600 mr-2">📊</span>
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className="font-bold text-green-600 text-lg">{mep.attendancePct}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Votes Cast</span>
                  <span className="font-bold text-blue-600 text-lg">{mep.votesCast}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Votes</span>
                  <span className="font-bold text-purple-600 text-lg">{mep.votesTotal}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Committees</span>
                  <span className="font-bold text-orange-600 text-lg">{committees.length}</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-blue-600 mr-2">📧</span>
                Contact
              </h3>
              <div className="space-y-3">
                {mep.email && (
                  <a href={`mailto:${mep.email}`} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="mr-2">📧</span>
                    {mep.email}
                  </a>
                )}
                {mep.twitter && (
                  <a href={`https://twitter.com/${mep.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="mr-2">🐦</span>
                    @{mep.twitter}
                  </a>
                )}
                {mep.website && (
                  <a href={mep.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="mr-2">🌐</span>
                    Website
                  </a>
                )}
              </div>
            </div>

            {/* Related Links */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-green-600 mr-2">🔗</span>
                Related
              </h3>
              <div className="space-y-3">
                <Link href={`/meps/country/${mep.country.slug}`} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  <span className="mr-2">🏛️</span>
                  Other MEPs from {mep.country.name}
                </Link>
                {mep.party && (
                  <Link href={`/parties/${mep.party.slug}`} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <span className="mr-2">👥</span>
                    Other MEPs from {mep.party.name}
                  </Link>
                )}
                <Link href="/meps" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  <span className="mr-2">📋</span>
                  All MEPs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}