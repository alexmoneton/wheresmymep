'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CountryFlag from '@/components/CountryFlag';
import PartyBadge from '@/components/PartyBadge';

interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Ranking {
  mep: {
    name: string;
    country: string;
    party: string;
  };
  score: number;
  position: number;
}

interface RecentVote {
  title: string;
  date: string;
  result: string;
  totalFor: number;
  totalAgainst: number;
}

interface TopicClientPageProps {
  topic: Topic;
  contextualCopy: string;
  rankings: Ranking[];
  recentVotes: RecentVote[];
}

export default function TopicClientPage({ topic, contextualCopy, rankings, recentVotes }: TopicClientPageProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
            <Link href="/topics" className="text-blue-600 hover:text-blue-800">
              ← Back to Topics
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Topic Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {topic.name}
          </h1>
          {topic.description && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {topic.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {rankings.length}
              </div>
              <div className="text-sm text-gray-600">MEPs Ranked</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {recentVotes.length}
              </div>
              <div className="text-sm text-gray-600">Recent Votes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.round(rankings.reduce((sum, r) => sum + r.score, 0) / rankings.length)}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>
        </div>

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
        <Tabs defaultValue="rankings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="rankings">MEP Rankings</TabsTrigger>
            <TabsTrigger value="votes">Recent Votes</TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>

          <TabsContent value="rankings">
            <Card>
              <CardHeader>
                <CardTitle>MEP Rankings for {topic.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rankings.slice(0, 20).map((ranking) => (
                    <div key={ranking.position} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            {ranking.position}
                          </span>
                        </div>
                        <div>
                          <Link 
                            href={`/meps/${ranking.mep.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {ranking.mep.name}
                          </Link>
                          <div className="flex items-center space-x-2 mt-1">
                            <CountryFlag country={ranking.mep.country} className="text-sm" />
                            <span className="text-sm text-gray-600">{ranking.mep.country}</span>
                            <PartyBadge party={ranking.mep.party} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(ranking.score)}`}>
                          {ranking.score}%
                        </div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="votes">
            <Card>
              <CardHeader>
                <CardTitle>Recent Votes on {topic.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentVotes.map((vote, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {vote.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{formatDate(vote.date)}</span>
                        <Badge variant={vote.result === 'adopted' ? 'default' : 'secondary'}>
                          {vote.result}
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600">For: {vote.totalFor}</span>
                        <span className="text-red-600">Against: {vote.totalAgainst}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="related">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Related Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Other policy areas that may be related to {topic.name}
                  </p>
                  <Link 
                    href="/topics"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View All Topics →
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Related Committees</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Parliamentary committees that work on {topic.name} issues
                  </p>
                  <Link 
                    href="/committees"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View All Committees →
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
                href="/rankings"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 mb-2">All Rankings</h3>
                <p className="text-sm text-gray-600">View comprehensive MEP performance rankings</p>
              </Link>
              <Link 
                href="/committees"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 mb-2">Committees</h3>
                <p className="text-sm text-gray-600">Explore parliamentary committees and their work</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
