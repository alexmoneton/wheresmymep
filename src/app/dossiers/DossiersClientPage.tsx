'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Dossier {
  id: string;
  title: string;
  code?: string;
  slug: string;
  summary?: string;
  policyAreas: string[];
  votes: Array<{
    id: string;
    title: string;
    date: Date;
    mepVotes: Array<{
      choice: string;
      mep: {
        firstName: string;
        lastName: string;
        country: { name: string };
        party?: { name: string };
      };
    }>;
  }>;
  tags: Array<{
    tag: {
      name: string;
      slug: string;
    };
  }>;
}

interface DossiersClientPageProps {
  dossiers: Dossier[];
}

export default function DossiersClientPage({ dossiers }: DossiersClientPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDossiers = dossiers.filter(dossier =>
    dossier.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dossier.summary && dossier.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
    dossier.policyAreas.some(area => area.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getVoteStats = (votes: Dossier['votes']) => {
    const totalVotes = votes.length;
    const totalMEPVotes = votes.reduce((sum, vote) => sum + vote.mepVotes.length, 0);
    const recentVote = votes.length > 0 ? votes[0] : null;
    
    return {
      totalVotes,
      totalMEPVotes,
      recentVote,
    };
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Legislative Dossiers
            </h1>
            <p className="text-lg text-gray-600">
              Current European Parliament proposals and legislation
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
                {dossiers.length}
              </div>
              <div className="text-sm text-gray-600">Active Dossiers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {dossiers.reduce((sum, d) => sum + d.votes.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Votes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {new Set(dossiers.flatMap(d => d.policyAreas)).size}
              </div>
              <div className="text-sm text-gray-600">Policy Areas</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Search dossiers..."
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
                Legislative dossiers represent the formal legislative process in the European Parliament, 
                containing proposals, amendments, and policy initiatives that shape European law. Each dossier 
                goes through multiple stages including committee review, plenary debate, and voting.
              </p>
              <p className="mb-4">
                These dossiers cover a wide range of policy areas from climate change and digital regulation 
                to trade agreements and social policy. Understanding the progression of dossiers helps track 
                how European policy evolves and how MEPs engage with key legislative initiatives.
              </p>
              <p>
                Each dossier page shows the voting history, policy areas covered, and key stakeholders involved. 
                This transparency helps citizens understand the legislative process and track how their 
                representatives are working on issues that matter to them.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dossiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDossiers.map((dossier) => {
            const stats = getVoteStats(dossier.votes);
            
            return (
              <Card key={dossier.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link 
                      href={`/dossiers/${dossier.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {dossier.title}
                    </Link>
                  </CardTitle>
                  {dossier.code && (
                    <Badge variant="outline" className="w-fit">
                      {dossier.code}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {dossier.summary && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {dossier.summary}
                    </p>
                  )}
                  
                  {/* Policy Areas */}
                  {dossier.policyAreas.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {dossier.policyAreas.slice(0, 3).map((area) => (
                          <Badge key={area} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                        {dossier.policyAreas.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{dossier.policyAreas.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Vote Statistics */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Votes:</span>
                      <span className="font-medium">{stats.totalVotes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">MEP Votes:</span>
                      <span className="font-medium">{stats.totalMEPVotes}</span>
                    </div>
                    {stats.recentVote && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Latest:</span>
                        <span className="font-medium">{formatDate(stats.recentVote.date)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {dossier.tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex flex-wrap gap-1">
                        {dossier.tags.slice(0, 3).map(({ tag }) => (
                          <Badge key={tag.slug} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {dossier.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{dossier.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredDossiers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No dossiers found matching your search.</p>
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
                href="/votes"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 mb-2">Recent Votes</h3>
                <p className="text-sm text-gray-600">View recent parliamentary votes</p>
              </Link>
              <Link 
                href="/meps"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 mb-2">All MEPs</h3>
                <p className="text-sm text-gray-600">Browse all Members of the European Parliament</p>
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
