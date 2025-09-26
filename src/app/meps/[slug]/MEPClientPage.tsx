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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            {mep.photoUrl && (
              <img
                src={mep.photoUrl}
                alt={fullName}
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-lg text-gray-600">
                {mep.country.name} • {mep.party?.name || 'Independent'}
              </p>
              <p className="text-sm text-gray-500">
                Attendance: {mep.attendancePct}% ({mep.votesCast}/{mep.votesTotal} votes)
              </p>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 whitespace-pre-line">{contextualCopy}</p>
            </div>

            {/* Committee Memberships */}
            {committees.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Committee Memberships</h2>
                <div className="space-y-2">
                  {committees.map((committee, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium">{committee.name}</span>
                      <span className="text-sm text-gray-500 capitalize">{committee.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Votes */}
            {recentVotes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Votes</h2>
                <div className="space-y-3">
                  {recentVotes.slice(0, 5).map((vote, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{vote.title}</p>
                        <p className="text-sm text-gray-500">{new Date(vote.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        vote.choice === 'for' ? 'bg-green-100 text-green-800' :
                        vote.choice === 'against' ? 'bg-red-100 text-red-800' :
                        vote.choice === 'abstain' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {vote.choice}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className="font-semibold">{mep.attendancePct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Votes Cast</span>
                  <span className="font-semibold">{mep.votesCast}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Votes</span>
                  <span className="font-semibold">{mep.votesTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Committees</span>
                  <span className="font-semibold">{committees.length}</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-2">
                {mep.email && (
                  <a href={`mailto:${mep.email}`} className="block text-blue-600 hover:text-blue-800">
                    {mep.email}
                  </a>
                )}
                {mep.twitter && (
                  <a href={`https://twitter.com/${mep.twitter}`} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800">
                    @{mep.twitter}
                  </a>
                )}
                {mep.website && (
                  <a href={mep.website} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800">
                    Website
                  </a>
                )}
              </div>
            </div>

            {/* Related Links */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related</h3>
              <div className="space-y-2">
                <Link href={`/meps/country/${mep.country.slug}`} className="block text-blue-600 hover:text-blue-800">
                  Other MEPs from {mep.country.name}
                </Link>
                {mep.party && (
                  <Link href={`/parties/${mep.party.slug}`} className="block text-blue-600 hover:text-blue-800">
                    Other MEPs from {mep.party.name}
                  </Link>
                )}
                <Link href="/meps" className="block text-blue-600 hover:text-blue-800">
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