'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MEP, Country, Party, Membership, Committee } from '@prisma/client';

interface MEPsClientPageProps {
  meps: (MEP & {
    country: Country;
    party: Party | null;
    memberships: (Membership & {
      committee: Committee;
    })[];
  })[];
  countries: Country[];
  parties: Party[];
  committees: Committee[];
}

export default function MEPsClientPage({ meps, countries, parties, committees }: MEPsClientPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  const [selectedCommittee, setSelectedCommittee] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'country' | 'attendance'>('name');

  const filteredMEPs = useMemo(() => {
    let filtered = meps;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(mep => 
        `${mep.firstName} ${mep.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mep.country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mep.party?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Country filter
    if (selectedCountry) {
      filtered = filtered.filter(mep => mep.country.slug === selectedCountry);
    }

    // Party filter
    if (selectedParty) {
      filtered = filtered.filter(mep => mep.party?.slug === selectedParty);
    }

    // Committee filter
    if (selectedCommittee) {
      filtered = filtered.filter(mep => 
        mep.memberships.some(m => m.committee.slug === selectedCommittee)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'country':
          return a.country.name.localeCompare(b.country.name);
        case 'attendance':
          return (b.attendancePct || 0) - (a.attendancePct || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [meps, searchTerm, selectedCountry, selectedParty, selectedCommittee, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              All MEPs
            </h1>
            <p className="text-lg text-gray-600">
              Browse and filter Members of the European Parliament
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search MEPs..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country.id} value={country.slug}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Party Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party
              </label>
              <select
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Parties</option>
                {parties.map(party => (
                  <option key={party.id} value={party.slug}>
                    {party.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Committee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Committee
              </label>
              <select
                value={selectedCommittee}
                onChange={(e) => setSelectedCommittee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Committees</option>
                {committees.map(committee => (
                  <option key={committee.id} value={committee.slug}>
                    {committee.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'country' | 'attendance')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="country">Country</option>
                <option value="attendance">Attendance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredMEPs.length} MEP{filteredMEPs.length !== 1 ? 's' : ''} found
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredMEPs.map((mep) => {
              const fullName = `${mep.firstName} ${mep.lastName}`;
              const slug = fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              
              return (
                <div key={mep.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {mep.photoUrl && (
                        <img
                          src={mep.photoUrl}
                          alt={fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <Link 
                          href={`/meps/${slug}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600"
                        >
                          {fullName}
                        </Link>
                        <p className="text-sm text-gray-600">
                          {mep.country.name} • {mep.party?.name || 'Independent'}
                        </p>
                        {mep.memberships.length > 0 && (
                          <p className="text-xs text-gray-500">
                            {mep.memberships.map(m => m.committee.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {mep.attendancePct}% attendance
                      </div>
                      <div className="text-xs text-gray-500">
                        {mep.votesCast}/{mep.votesTotal} votes
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}


