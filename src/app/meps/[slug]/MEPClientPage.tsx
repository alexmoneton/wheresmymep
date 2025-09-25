'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CountryFlag from '@/components/CountryFlag';
import PartyBadge from '@/components/PartyBadge';
import SpecialRoleBadge from '@/components/SpecialRoleBadge';

interface MEP {
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  photoUrl?: string;
  country: { name: string; code: string };
  party?: { name: string; abbreviation?: string };
  twitter?: string;
  website?: string;
  email?: string;
  attendancePct: number;
  votesCast: number;
  votesTotal: number;
  memberships: Array<{
    committee: { name: string; code: string };
    role: string;
  }>;
  votes: Array<{
    choice: string;
    vote: {
      id: string;
      title: string;
      date: Date;
      description?: string;
      dossier?: { title: string; code?: string };
    };
  }>;
}

interface Committee {
  name: string;
  role: string;
}

interface RecentVote {
  title: string;
  choice: string;
  date: string;
}

interface MEPClientPageProps {
  mep: MEP;
  contextualCopy: string;
  committees: Committee[];
  recentVotes: RecentVote[];
}

export default function MEPClientPage({ mep, contextualCopy, committees, recentVotes }: MEPClientPageProps) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Home
            </Link>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm">
                Create Alert
              </Button>
              <Button variant="outline" size="sm">
                Export Votes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* MEP Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Photo */}
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                {mep.photoUrl ? (
                  <img
                    src={mep.photoUrl}
                    alt={`${mep.firstName} ${mep.lastName}`}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-500">
                    {mep.firstName[0]}{mep.lastName[0]}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {mep.firstName} {mep.lastName}
                  </h1>
                  <CountryFlag country={mep.country.name} className="text-2xl" />
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {mep.party && (
                    <PartyBadge party={mep.party.name} className="text-sm" />
                  )}
                  <Badge variant="outline" className="text-sm">
                    {mep.country.name}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>Country: {mep.country.name}</span>
                  {mep.party && (
                    <span>Party: {mep.party.name}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contextual Copy */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none text-gray-700">
              {contextualCopy.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="committees">Committees</TabsTrigger>
            <TabsTrigger value="votes">Recent Votes</TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {mep.attendancePct}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Attendance</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {mep.votesCast}
                    </div>
                    <div className="text-sm text-gray-600">Votes Cast</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-600 mb-2">
                      {mep.votesTotal}
                    </div>
                    <div className="text-sm text-gray-600">Total Votes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="committees">
            <Card>
              <CardHeader>
                <CardTitle>Committee Memberships</CardTitle>
              </CardHeader>
              <CardContent>
                {committees.length > 0 ? (
                  <div className="space-y-4">
                    {committees.map((committee, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{committee.name}</h3>
                          <p className="text-sm text-gray-600">Role: {committee.role}</p>
                        </div>
                        <Badge variant="outline">
                          {committee.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No committee memberships recorded.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="votes">
            <Card>
              <CardHeader>
                <CardTitle>Recent Votes</CardTitle>
              </CardHeader>
              <CardContent>
                {mep.votes.length > 0 ? (
                  <div className="space-y-4">
                    {mep.votes.map((mepVote) => (
                      <div key={mepVote.vote.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {mepVote.vote.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span>{formatDate(mepVote.vote.date)}</span>
                              {mepVote.vote.dossier && (
                                <span>Dossier: {mepVote.vote.dossier.title}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 md:mt-0 md:ml-4">
                            <Badge className={getVotePositionColor(mepVote.choice)}>
                              {mepVote.choice}
                            </Badge>
                          </div>
                        </div>
                        
                        {mepVote.vote.description && (
                          <p className="text-sm text-gray-600 mb-4">
                            {mepVote.vote.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent votes found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="related">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Related MEPs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Other MEPs from {mep.country.name}
                  </p>
                  <Button variant="outline" className="w-full">
                    View All {mep.country.name} MEPs
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Related Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Policy areas this MEP has voted on
                  </p>
                  <Button variant="outline" className="w-full">
                    View Topic Rankings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Links */}
        {(mep.website || mep.twitter || mep.email) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mep.website && (
                  <a
                    href={mep.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <span className="mr-2">🔗</span>
                    Official Website
                  </a>
                )}
                {mep.twitter && (
                  <a
                    href={`https://twitter.com/${mep.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <span className="mr-2">🐦</span>
                    Twitter
                  </a>
                )}
                {mep.email && (
                  <a
                    href={`mailto:${mep.email}`}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <span className="mr-2">📧</span>
                    Email
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Methodology */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Methodology
            </h3>
            <p className="text-sm text-blue-800">
              Attendance is calculated based on roll-call votes in the European Parliament over the last 180 days. 
              Abstaining counts as present; not voting counts as absent. Notable votes are selected based on 
              significance, close outcomes, and high participation. Some MEPs may have partial terms affecting 
              their attendance percentage.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
