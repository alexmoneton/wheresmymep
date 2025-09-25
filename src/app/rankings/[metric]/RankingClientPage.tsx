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
  party?: { name: string; abbreviation?: string };
  attendancePct: number;
  votesCast: number;
  votesTotal: number;
  score: number;
  position: number;
  memberships: Array<{
    committee: { name: string; code: string };
    role: string;
  }>;
}

interface RankingData {
  metric: string;
  meps: MEP[];
  totalMEPs: number;
  scoreType: string;
}

interface RankingClientPageProps {
  rankingData: RankingData;
}

export default function RankingClientPage({ rankingData }: RankingClientPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [partyFilter, setPartyFilter] = useState('');

  const filteredMEPs = rankingData.meps.filter(mep => {
    const matchesSearch = mep.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mep.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = !countryFilter || mep.country.name === countryFilter;
    const matchesParty = !partyFilter || mep.party?.name === partyFilter;
    return matchesSearch && matchesCountry && matchesParty;
  });

  const uniqueCountries = Array.from(new Set(rankingData.meps.map(mep => mep.country.name)));
  const uniqueParties = Array.from(new Set(
    rankingData.meps
      .map(mep => mep.party?.name)
      .filter(Boolean)
  ));

  const getScoreColor = (score: number, scoreType: string) => {
    if (scoreType === 'activity') {
      if (score >= 150) return 'text-green-600';
      if (score >= 100) return 'text-yellow-600';
      if (score >= 50) return 'text-orange-600';
      return 'text-red-600';
    } else {
      if (score >= 90) return 'text-green-600';
      if (score >= 80) return 'text-yellow-600';
      if (score >= 70) return 'text-orange-600';
      return 'text-red-600';
    }
  };

  const getScoreLabel = (scoreType: string) => {
    switch (scoreType) {
      case 'attendance':
        return 'Attendance %';
      case 'activity':
        return 'Votes Participated';
      case 'topic':
        return 'Score';
      default:
        return 'Score';
    }
  };

  const getMetricTitle = (metric: string) => {
    return metric.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/rankings" className="text-blue-600 hover:text-blue-800">
              ← Back to All Rankings
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ranking Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {getMetricTitle(rankingData.metric)} Rankings
          </h1>
          <p className="text-lg text-gray-600">
            {rankingData.totalMEPs} Members of the European Parliament ranked by {rankingData.metric.replace('-', ' ')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {rankingData.totalMEPs}
              </div>
              <div className="text-sm text-gray-600">MEPs Ranked</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round(rankingData.meps.reduce((sum, mep) => sum + mep.score, 0) / rankingData.meps.length)}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {uniqueCountries.length}
              </div>
              <div className="text-sm text-gray-600">Countries</div>
            </CardContent>
          </Card>
        </div>

        {/* Contextual Copy */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="mb-4">
                These rankings show how Members of the European Parliament perform on {rankingData.metric.replace('-', ' ')} metrics. 
                The rankings are based on {rankingData.scoreType === 'attendance' ? 'roll-call vote attendance over the last 180 days' : 
                rankingData.scoreType === 'activity' ? 'total number of votes participated in' : 'topic-specific performance indicators'}.
              </p>
              <p className="mb-4">
                Understanding these rankings helps identify which MEPs are most active and engaged in specific policy areas 
                or overall parliamentary work. This data provides valuable insight into parliamentary engagement patterns 
                and helps citizens track how their representatives are performing.
              </p>
              <p>
                Use the filters below to explore rankings by country or political party, or search for specific MEPs 
                to see how they rank compared to their peers in the European Parliament.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Party
                </label>
                <Select value={partyFilter} onValueChange={setPartyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All parties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All parties</SelectItem>
                    {uniqueParties.map(party => (
                      <SelectItem key={party} value={party}>
                        {party}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rankings List */}
        <Card>
          <CardHeader>
            <CardTitle>MEP Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMEPs.map((mep) => (
                <div key={mep.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {mep.position}
                      </span>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {mep.photoUrl ? (
                        <img
                          src={mep.photoUrl}
                          alt={`${mep.firstName} ${mep.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-gray-500">
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
                        {mep.party && <PartyBadge party={mep.party.name} />}
                      </div>
                      {mep.memberships.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {mep.memberships.length} committee{mep.memberships.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(mep.score, rankingData.scoreType)}`}>
                      {rankingData.scoreType === 'attendance' ? `${mep.score}%` : mep.score}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getScoreLabel(rankingData.scoreType)}
                    </div>
                    {rankingData.scoreType === 'attendance' && (
                      <div className="text-xs text-gray-500">
                        {mep.votesCast}/{mep.votesTotal} votes
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {filteredMEPs.length === 0 && (
          <Card className="mt-8">
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
                href="/topics"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-blue-600 mb-2">Policy Topics</h3>
                <p className="text-sm text-gray-600">View MEP rankings by policy area</p>
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
