'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface RankingCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

interface RankingsClientPageProps {
  rankingCategories: RankingCategory[];
}

export default function RankingsClientPage({ rankingCategories }: RankingsClientPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = rankingCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              MEP Rankings
            </h1>
            <p className="text-lg text-gray-600">
              Performance & activity rankings by category
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
                {rankingCategories.length}
              </div>
              <div className="text-sm text-gray-600">Ranking Categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                705
              </div>
              <div className="text-sm text-gray-600">MEPs Ranked</div>
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
                placeholder="Search ranking categories..."
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
                These comprehensive rankings help citizens, journalists, and researchers understand how Members of the European Parliament 
                perform across different metrics and policy areas. Rankings are based on voting patterns, attendance records, and engagement 
                levels in specific policy domains.
              </p>
              <p className="mb-4">
                Each ranking category provides insights into MEP performance, from overall attendance and activity levels to specific policy 
                positions on critical issues like climate change, migration, digital policy, and more. This data helps identify which 
                representatives are most active and consistent in their support for different policy areas.
              </p>
              <p>
                Understanding these rankings provides valuable insight into the political dynamics that drive policy outcomes in the European 
                Parliament and helps stakeholders identify which MEPs are leading on specific issues that matter to citizens across the EU.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.slug} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <Link 
                    href={`/rankings/${category.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {category.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {category.description}
                </p>
                
                <div className="space-y-2">
                  <Link 
                    href={`/rankings/${category.slug}`}
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

        {filteredCategories.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No ranking categories found matching your search.</p>
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
                href="/topics"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 mb-2">Policy Topics</h3>
                <p className="text-sm text-gray-600">Explore MEP rankings by policy area</p>
              </Link>
              <Link 
                href="/committees"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 mb-2">Committees</h3>
                <p className="text-sm text-gray-600">View parliamentary committees and their work</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


