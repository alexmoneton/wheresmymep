'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Topic {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

interface TopicsClientPageProps {
  topics: Topic[];
}

export default function TopicsClientPage({ topics }: TopicsClientPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (topic.description && topic.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTopicIcon = (topicName: string) => {
    const name = topicName.toLowerCase();
    if (name.includes('climate') || name.includes('environment')) return '🌱';
    if (name.includes('energy')) return '⚡';
    if (name.includes('migration') || name.includes('asylum')) return '🚶';
    if (name.includes('digital') || name.includes('technology')) return '💻';
    if (name.includes('trade') || name.includes('economy')) return '💰';
    if (name.includes('agriculture')) return '🚜';
    if (name.includes('health')) return '🏥';
    if (name.includes('education') || name.includes('culture')) return '📚';
    if (name.includes('transport')) return '🚗';
    if (name.includes('defense') || name.includes('security')) return '🛡️';
    if (name.includes('foreign')) return '🌍';
    if (name.includes('human rights')) return '🤝';
    if (name.includes('democracy') || name.includes('rule of law')) return '⚖️';
    if (name.includes('justice') || name.includes('home affairs')) return '🏛️';
    return '📋';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Policy Topics
            </h1>
            <p className="text-lg text-gray-600">
              MEP rankings and voting patterns by policy area
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
                {topics.length}
              </div>
              <div className="text-sm text-gray-600">Policy Topics</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                705
              </div>
              <div className="text-sm text-gray-600">MEPs Tracked</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                1000+
              </div>
              <div className="text-sm text-gray-600">Votes Analyzed</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Search policy topics..."
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
                Understanding how MEPs vote on different policy topics provides valuable insight into their policy priorities 
                and alignment with different political positions. These rankings help citizens, journalists, and researchers 
                identify which representatives are most active and consistent in their support for specific policy areas.
              </p>
              <p className="mb-4">
                Each topic page shows MEP rankings based on their voting patterns, recent votes on related issues, and 
                overall engagement with the policy area. This helps stakeholders understand the political dynamics that 
                drive policy outcomes in crucial areas like climate change, migration, digital policy, and more.
              </p>
              <p>
                Tracking voting patterns across policy topics reveals important trends in European politics and helps 
                identify which MEPs are leading on specific issues that matter to citizens across the European Union.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-3">
                  <span className="text-2xl">{getTopicIcon(topic.name)}</span>
                  <Link 
                    href={`/topics/${topic.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {topic.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topic.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {topic.description}
                  </p>
                )}
                
                <div className="space-y-2">
                  <Link 
                    href={`/topics/${topic.slug}`}
                    className="inline-block w-full"
                  >
                    <Badge variant="outline" className="w-full justify-center">
                      View Rankings
                    </Badge>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No topics found matching your search.</p>
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
                href="/committees"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 mb-2">Committees</h3>
                <p className="text-sm text-gray-600">Explore parliamentary committees and their work</p>
              </Link>
              <Link 
                href="/rankings"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 mb-2">All Rankings</h3>
                <p className="text-sm text-gray-600">View comprehensive MEP performance rankings</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
