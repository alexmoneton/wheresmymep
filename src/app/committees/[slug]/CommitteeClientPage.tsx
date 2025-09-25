'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CountryFlag from '@/components/CountryFlag';
import PartyBadge from '@/components/PartyBadge';

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

interface Member {
  name: string;
  country: string;
  party: string;
  role: string;
}

interface CommitteeClientPageProps {
  committee: Committee;
  contextualCopy: string;
  members: Member[];
}

export default function CommitteeClientPage({ committee, contextualCopy, members }: CommitteeClientPageProps) {
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

  const getRolePriority = (role: string) => {
    switch (role.toLowerCase()) {
      case 'chair':
        return 1;
      case 'vicechair':
        return 2;
      case 'member':
        return 3;
      case 'substitute':
        return 4;
      default:
        return 5;
    }
  };

  const sortedMembers = committee.memberships.sort((a, b) => {
    const roleA = getRolePriority(a.role);
    const roleB = getRolePriority(b.role);
    if (roleA !== roleB) return roleA - roleB;
    return a.mep.lastName.localeCompare(b.mep.lastName);
  });

  const chairs = sortedMembers.filter(m => m.role === 'chair');
  const viceChairs = sortedMembers.filter(m => m.role === 'vicechair');
  const regularMembers = sortedMembers.filter(m => m.role === 'member');
  const substitutes = sortedMembers.filter(m => m.role === 'substitute');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/committees" className="text-blue-600 hover:text-blue-800">
              ← Back to Committees
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Committee Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {committee.name}
              </h1>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {committee.code}
              </Badge>
              {committee.description && (
                <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
                  {committee.description}
                </p>
              )}
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {committee.memberships.length}
              </div>
              <div className="text-sm text-gray-600">Total Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {chairs.length}
              </div>
              <div className="text-sm text-gray-600">Chairs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {viceChairs.length}
              </div>
              <div className="text-sm text-gray-600">Vice-Chairs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {regularMembers.length}
              </div>
              <div className="text-sm text-gray-600">Members</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="leadership">Leadership</TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>All Committee Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedMembers.map((membership) => (
                    <div key={membership.mep.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <CountryFlag country={membership.mep.country.name} className="text-lg" />
                        <div>
                          <Link 
                            href={`/meps/${membership.mep.slug}`}
                            className="font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {membership.mep.firstName} {membership.mep.lastName}
                          </Link>
                          <div className="text-sm text-gray-600">
                            {membership.mep.country.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {membership.mep.party && (
                          <PartyBadge party={membership.mep.party.name} />
                        )}
                        <Badge className={getRoleColor(membership.role)}>
                          {membership.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leadership">
            <div className="grid md:grid-cols-2 gap-6">
              {chairs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Chair{chairs.length > 1 ? 's' : ''}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chairs.map((membership) => (
                        <div key={membership.mep.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <CountryFlag country={membership.mep.country.name} className="text-lg" />
                          <div className="flex-1">
                            <Link 
                              href={`/meps/${membership.mep.slug}`}
                              className="font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {membership.mep.firstName} {membership.mep.lastName}
                            </Link>
                            <div className="text-sm text-gray-600">
                              {membership.mep.country.name}
                            </div>
                          </div>
                          {membership.mep.party && (
                            <PartyBadge party={membership.mep.party.name} />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {viceChairs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vice-Chair{viceChairs.length > 1 ? 's' : ''}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {viceChairs.map((membership) => (
                        <div key={membership.mep.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <CountryFlag country={membership.mep.country.name} className="text-lg" />
                          <div className="flex-1">
                            <Link 
                              href={`/meps/${membership.mep.slug}`}
                              className="font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {membership.mep.firstName} {membership.mep.lastName}
                            </Link>
                            <div className="text-sm text-gray-600">
                              {membership.mep.country.name}
                            </div>
                          </div>
                          {membership.mep.party && (
                            <PartyBadge party={membership.mep.party.name} />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="related">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Related Committees</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Other committees that may work on related issues
                  </p>
                  <Link 
                    href="/committees"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View All Committees →
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Related Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Policy areas this committee focuses on
                  </p>
                  <Link 
                    href="/topics"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Topic Rankings →
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
                href="/dossiers"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 mb-2">Legislative Dossiers</h3>
                <p className="text-sm text-gray-600">Explore current legislative proposals</p>
              </Link>
              <Link 
                href="/votes"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 mb-2">Recent Votes</h3>
                <p className="text-sm text-gray-600">View recent parliamentary votes</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
