'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Vote {
  id: string;
  epVoteId: string;
  title: string;
  date: Date;
  description?: string;
  dossier?: {
    title: string;
    code?: string;
  };
  mepVotes: Array<{
    choice: string;
    mep: {
      firstName: string;
      lastName: string;
      country: { name: string };
      party?: { name: string };
    };
  }>;
}

interface VotesClientPageProps {
  votes: Vote[];
}

export default function VotesClientPage({ votes }: VotesClientPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVotes = votes.filter(vote =>
    vote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (vote.description && vote.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (vote.dossier && vote.dossier.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getVotePositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'for':
        return 'bg-green-100 text-green-800';
      case 'against':
        return 'bg-red-100 text-red-800';
      case 'abstain':
        return 'bg-yellow-100 text-yellow-800';
      case 'absent':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVoteStats = (mepVotes: Vote['mepVotes']) => {
    const stats = { for: 0, against: 0, abstain: 0, absent: 0 };
    for (const vote of mepVotes) {
      const choice = vote.choice.toLowerCase();
      if (choice in stats) {
        stats[choice as keyof typeof stats]++;
      }
    }
    return stats;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Recent Votes
            </h1>
            <p className="text-lg text-gray-600">
              European Parliament roll-call votes
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {votes.length}
              </div>
              <div className="text-sm text-gray-600">Recent Votes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {votes.filter(v => v.dossier).length}
              </div>
              <div className="text-sm text-gray-600">With Dossiers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {votes.reduce((sum, v) => sum + v.mepVotes.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total MEP Votes</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Search votes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contextual Copy */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="mb-4">
                Roll-call votes in the European Parliament provide transparency into how individual Members 
                position themselves on important policy issues. These votes are recorded individually, 
                allowing citizens to see exactly how their representatives voted on key legislation, 
                amendments, and policy proposals.
              </p>
              <p className="mb-4">
                Each vote shows the breakdown of For/Against/Abstain positions, along with instances of 
                non-participation. Understanding voting patterns helps identify political alignments, 
                policy priorities, and the democratic process in action at the European level.
              </p>
              <p>
                Use the search function to find votes on specific topics, or explore recent votes to 
                understand current policy debates and how MEPs are responding to key European issues.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Votes List */}
        <div className="space-y-6">
          {filteredVotes.map((vote) => {
            const stats = getVoteStats(vote.mepVotes);
            const totalVotes = stats.for + stats.against + stats.abstain + stats.absent;
            
            return (
              <Card key={vote.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        <Link 
                          href={`/votes/${vote.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {vote.title}
                        </Link>
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span>{formatDate(vote.date)}</span>
                        {vote.dossier && (
                          <Badge variant="outline">
                            {vote.dossier.title}
                          </Badge>
                        )}
                        <span>{totalVotes} MEPs voted</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {vote.description && (
                    <p className="text-sm text-gray-600 mb-4">
                      {vote.description}
                    </p>
                  )}
                  
                  {/* Vote Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.for}</div>
                      <div className="text-xs text-gray-600">For</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{stats.against}</div>
                      <div className="text-xs text-gray-600">Against</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{stats.abstain}</div>
                      <div className="text-xs text-gray-600">Abstain</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{stats.absent}</div>
                      <div className="text-xs text-gray-600">Absent</div>
                    </div>
                  </div>
                  
                  {/* Sample MEP Votes */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-900">Sample MEP Votes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {vote.mepVotes.slice(0, 8).map((mepVote, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Link 
                            href={`/meps/${mepVote.mep.firstName.toLowerCase()}-${mepVote.mep.lastName.toLowerCase()}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {mepVote.mep.firstName} {mepVote.mep.lastName}
                          </Link>
                          <Badge className={getVotePositionColor(mepVote.choice)}>
                            {mepVote.choice}
                          </Badge>
                        </div>
                      ))}
                      {vote.mepVotes.length > 8 && (
                        <span className="text-sm text-gray-500">
                          +{vote.mepVotes.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredVotes.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No votes found matching your search.</p>
            </CardContent>
          </Card>
        )}

        {/* Internal Links */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Related Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/meps"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 mb-2">All MEPs</h3>
                <p className="text-sm text-gray-600">Browse all Members of the European Parliament</p>
              </Link>
              <Link 
                href="/dossiers"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 mb-2">Legislative Dossiers</h3>
                <p className="text-sm text-gray-600">Explore current legislative proposals</p>
              </Link>
              <Link 
                href="/topics"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 mb-2">Policy Topics</h3>
                <p className="text-sm text-gray-600">View MEP rankings by policy area</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
