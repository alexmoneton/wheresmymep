'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import CountryFlag from '@/components/CountryFlag';
import PartyBadge from '@/components/PartyBadge';

interface MEP {
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  photoUrl?: string;
  country: { name: string; code: string };
  attendancePct: number;
  votesCast: number;
  votesTotal: number;
  memberships: Array<{
    committee: { name: string; code: string };
    role: string;
  }>;
}

interface CountryDistribution {
  country: string;
  count: number;
}

interface PartyData {
  id: string;
  name: string;
  abbreviation?: string;
  euGroup?: string;
  slug: string;
  meps: MEP[];
  totalMEPs: number;
  averageAttendance: number;
  countryDistribution: CountryDistribution[];
}

interface PartyMEPsClientPageProps {
  partyData: PartyData;
}

export default function PartyMEPsClientPage({ partyData }: PartyMEPsClientPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const filteredMEPs = partyData.meps.filter(mep => {
    const matchesSearch = mep.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mep.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = !countryFilter || mep.country.name === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const uniqueCountries = Array.from(new Set(partyData.meps.map(mep => mep.country.name)));

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return 'text-green-600';
    if (attendance >= 80) return 'text-yellow-600';
    if (attendance >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/meps" className="text-blue-600 hover:text-blue-800">
              ← Back to All MEPs
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Party Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {partyData.name}
          </h1>
          {partyData.abbreviation && (
            <Badge variant="outline" className="text-lg px-4 py-2 mb-4">
              {partyData.abbreviation}
            </Badge>
          )}
          <p className="text-lg text-gray-600">
            {partyData.totalMEPs} Members of the European Parliament
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {partyData.totalMEPs}
              </div>
              <div className="text-sm text-gray-600">Total MEPs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {partyData.averageAttendance}%
              </div>
              <div className="text-sm text-gray-600">Average Attendance</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {uniqueCountries.length}
              </div>
              <div className="text-sm text-gray-600">Countries Represented</div>
            </CardContent>
          </Card>
        </div>

        {/* Contextual Copy */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="mb-4">
                {partyData.name} is one of the major political groups in the European Parliament, 
                represented by {partyData.totalMEPs} Members from {uniqueCountries.length} different countries. 
                The group maintains an average attendance rate of {partyData.averageAttendance}% across all its representatives.
              </p>
              <p className="mb-4">
                This political group plays a significant role in shaping European policy through its 
                participation in parliamentary committees, voting on key legislation, and influencing 
                the direction of EU governance. Understanding the voting patterns and attendance of 
                {partyData.name} MEPs provides insight into the group's policy priorities and 
                engagement with European democracy.
              </p>
              <p>
                The group's representation spans across multiple countries, with the largest delegations 
                coming from {partyData.countryDistribution.slice(0, 3).map(c => c.country).join(', ')}. 
                Use the filters below to explore individual MEPs, their committee work, and voting records 
                to understand how {partyData.name} engages with European legislative processes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Country Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Country Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {partyData.countryDistribution.map(({ country, count }) => (
                <div key={country} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CountryFlag country={country} className="text-lg" />
                    <span className="text-sm font-medium">{country}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search MEPs
                </label>
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Country
                </label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All countries</SelectItem>
                    {uniqueCountries.map(country => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MEPs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMEPs.map((mep) => (
            <Card key={mep.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    {mep.photoUrl ? (
                      <img
                        src={mep.photoUrl}
                        alt={`${mep.firstName} ${mep.lastName}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-gray-500">
                        {mep.firstName[0]}{mep.lastName[0]}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/meps/${mep.slug}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 block"
                    >
                      {mep.firstName} {mep.lastName}
                    </Link>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <CountryFlag country={mep.country.name} className="text-sm" />
                      <span className="text-sm text-gray-600">{mep.country.name}</span>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <div className={`text-sm font-semibold ${getAttendanceColor(mep.attendancePct)}`}>
                        {mep.attendancePct}% attendance
                      </div>
                      <div className="text-xs text-gray-500">
                        {mep.votesCast} of {mep.votesTotal} votes
                      </div>
                    </div>
                    
                    {mep.memberships.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500">
                          {mep.memberships.length} committee{mep.memberships.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMEPs.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No MEPs found matching your filters.</p>
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
                <h3 className="font-semibold text-blue-600 mb-2">Rankings</h3>
                <p className="text-sm text-gray-600">View MEP performance rankings</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


