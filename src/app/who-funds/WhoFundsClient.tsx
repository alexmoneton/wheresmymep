'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shadcn/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';
import { Badge } from '@/components/shadcn/ui/badge';
import { Search, FileText, ExternalLink, AlertTriangle, ArrowLeft, TrendingUp } from 'lucide-react';
import { WhoFundsData, WhoFundsIndex } from '@/lib/zod/whofunds';

interface MEP {
  id: string;
  name: string;
  country: string;
  party: string;
}

export function WhoFundsClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MEP[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [whoFundsIndex, setWhoFundsIndex] = useState<WhoFundsIndex | null>(null);
  const router = useRouter();

  // Load WhoFunds index data
  useEffect(() => {
    const loadWhoFundsIndex = async () => {
      try {
        const response = await fetch('/data/whofunds/index.json');
        const data = await response.json();
        setWhoFundsIndex(data);
      } catch (error) {
        console.error('Error loading WhoFunds index:', error);
      }
    };
    loadWhoFundsIndex();
  }, []);

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/meps?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      setSearchResults(results.slice(0, 5)); // Show top 5 results
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/leaderboard?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const getTopMEPs = () => {
    if (!whoFundsIndex) return [];
    return whoFundsIndex.meps
      .filter(mep => (mep.total_income_entries + mep.total_gifts_entries) > 0)
      .sort((a, b) => (b.total_income_entries + b.total_gifts_entries) - (a.total_income_entries + a.total_gifts_entries))
      .slice(0, 20);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Where's My MEP?</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/who-funds" className="text-gray-900 font-medium">
                WhoFundsMyMEP
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Free
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              WhoFundsMyMEP (preview)
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Outside income & support from official declarations
            </p>
            <p className="text-lg text-gray-700 mb-8 max-w-4xl mx-auto">
              We summarise <strong>Declarations of Members' Financial/Private Interests</strong> and link to official PDFs. 
              This preview shows sample data to demonstrate the concept.
            </p>
            
            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Search MEPs
              </h2>
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder="Search by name or country..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="px-6 py-2">
                    Search
                  </Button>
                  <Link href="/leaderboard">
                    <Button variant="outline" className="px-6 py-2">
                      View All
                    </Button>
                  </Link>
                </div>
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {searchResults.map((mep: MEP) => (
                      <Link
                        key={mep.id}
                        href={`/mep/${mep.id}`}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-medium text-gray-900">{mep.name}</div>
                            <div className="text-sm text-gray-600">{mep.country}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{mep.party}</Badge>
                        </div>
                      </Link>
                    ))}
                    {searchResults.length === 5 && (
                      <div className="p-3 text-center text-sm text-gray-500 border-t border-gray-100">
                        <Link 
                          href={`/leaderboard?q=${encodeURIComponent(searchQuery)}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View all results →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top 20 by Declared Outside Income */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Top 20 by Financial Declaration Entries
            </h2>
          </div>
          
          {whoFundsIndex ? (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        MEP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Party
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Entries
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entries
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getTopMEPs().map((mep, index) => (
                      <tr key={mep.mep_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            href={`/mep/${mep.mep_id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            {mep.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {mep.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="text-xs">
                            {mep.party}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {mep.total_income_entries + mep.total_gifts_entries}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {mep.total_income_entries} income, {mep.total_gifts_entries} gifts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {getTopMEPs().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No MEPs with financial declaration entries found.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading leaderboard...</p>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Last Updated</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {whoFundsIndex?.meta.generated_at ? 
                  new Date(whoFundsIndex.meta.generated_at).toLocaleDateString() : 
                  'Loading...'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {whoFundsIndex?.meta.total_meps || 0} MEPs tracked
              </p>
              <Link href="/who-funds/methodology" className="mt-3 block">
                <Button variant="outline" size="sm" className="w-full">
                  View Methodology
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>Preview Notice</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                This is a preview with sample data. Always refer to the official 
                declarations for authoritative information.
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.europarl.europa.eu/meps" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Official Declarations
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Last Updated */}
        {whoFundsIndex && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Last updated: {new Date(whoFundsIndex.meta.generated_at).toLocaleDateString()} • 
              {whoFundsIndex.meta.total_meps} MEPs tracked
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
