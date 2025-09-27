'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Committee {
  id: string;
  code: string;
  name: string;
  slug: string;
  description?: string;
  memberships: Array<{
    role: string;
    mep: {
      id: string;
      firstName: string;
      lastName: string;
      slug: string;
      country: { name: string; code: string };
      party?: { name: string; abbreviation?: string };
    };
  }>;
}

interface CommitteesClientPageProps {
  committees: Committee[];
  totalCommittees: number;
  totalMembers: number;
}

export default function CommitteesClientPage({ committees, totalCommittees, totalMembers }: CommitteesClientPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCommittees = committees.filter(committee =>
    committee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    committee.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (committee.description && committee.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'chair':
        return 'bg-blue-100 text-blue-800';
      case 'vicechair':
        return 'bg-purple-100 text-purple-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      case 'substitute':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              European Parliament Committees
            </h1>
            <p className="text-lg text-gray-600">
              Explore all committees and their members
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
                {totalCommittees}
              </div>
              <div className="text-sm text-gray-600">Committees</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {totalMembers}
              </div>
              <div className="text-sm text-gray-600">Total Memberships</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.round(totalMembers / totalCommittees)}
              </div>
              <div className="text-sm text-gray-600">Avg Members per Committee</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Search committees..."
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
                The European Parliament has {totalCommittees} specialized committees that play a crucial role in the legislative process. 
                Each committee focuses on specific policy areas and is responsible for examining proposed legislation, conducting hearings, 
                and preparing reports before they reach the full Parliament for final votes.
              </p>
              <p className="mb-4">
                Committee work is essential for the democratic functioning of the EU, allowing for detailed examination of complex policy 
                proposals and ensuring that diverse perspectives are considered in the legislative process. Members work together across 
                political groups to develop positions on proposed legislation.
              </p>
              <p>
                Understanding committee composition and activities helps citizens track how their representatives are working on issues 
                that matter to them, and provides insight into the complex decision-making processes that shape European policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Committees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommittees.map((committee) => (
            <Card key={committee.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link 
                    href={`/committees/${committee.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {committee.name}
                  </Link>
                </CardTitle>
                <Badge variant="outline" className="w-fit">
                  {committee.code}
                </Badge>
              </CardHeader>
              <CardContent>
                {committee.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {committee.description}
                  </p>
                )}
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900">
                    {committee.memberships.length} members
                  </div>
                  
                  {/* Show key members */}
                  <div className="space-y-1">
                    {committee.memberships
                      .filter(m => m.role === 'chair' || m.role === 'vicechair')
                      .slice(0, 2)
                      .map((membership) => (
                        <div key={membership.mep.id} className="flex items-center justify-between text-sm">
                          <Link 
                            href={`/meps/${membership.mep.slug}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {membership.mep.firstName} {membership.mep.lastName}
                          </Link>
                          <Badge className={getRoleColor(membership.role)}>
                            {membership.role}
                          </Badge>
                        </div>
                      ))}
                  </div>
                  
                  {committee.memberships.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{committee.memberships.length - 2} other members
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCommittees.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No committees found matching your search.</p>
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


