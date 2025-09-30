'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shadcn/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';
import { Badge } from '@/components/shadcn/ui/badge';
import { Search, FileText, ExternalLink, AlertTriangle, ArrowLeft } from 'lucide-react';

interface MEP {
  id: string;
  name: string;
  country: string;
  party: string;
}

interface WhoFundsData {
  meta: {
    generatedAt: string;
    sources: string[];
  };
  byMepId: Record<string, {
    lastUpdated: string;
    outsideActivities: Array<{
      role: string;
      paid: boolean;
      incomeBand?: string;
    }>;
    support: Array<{
      type: string;
      provider: string;
      note: string;
    }>;
    holdings: Array<{
      entity: string;
      note: string;
    }>;
    notes: string;
  }>;
}

export function WhoFundsClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MEP[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [whoFundsData, setWhoFundsData] = useState<WhoFundsData | null>(null);
  const router = useRouter();

  // Load WhoFunds data
  useEffect(() => {
    const loadWhoFundsData = async () => {
      try {
        const response = await fetch('/data/whofunds.sample.json');
        const data = await response.json();
        setWhoFundsData(data);
      } catch (error) {
        console.error('Error loading WhoFunds data:', error);
      }
    };
    loadWhoFundsData();
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

  const getSampleMEPs = () => {
    if (!whoFundsData) return [];
    return Object.keys(whoFundsData.byMepId).slice(0, 3);
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
        {/* Sample MEPs with Funding Data */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Sample MEPs with Funding Data
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getSampleMEPs().map((mepId) => {
              const mepData = whoFundsData?.byMepId[mepId];
              if (!mepData) return null;
              
              return (
                <Card key={mepId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">MEP {mepId}</CardTitle>
                    <CardDescription>
                      Sample funding data (preview)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mepData.outsideActivities.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Outside Activities</h4>
                          {mepData.outsideActivities.map((activity, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              • {activity.role}
                              {activity.paid && activity.incomeBand && (
                                <span className="text-blue-600 ml-1">({activity.incomeBand})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {mepData.support.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Support Received</h4>
                          {mepData.support.map((support, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              • {support.type} from {support.provider}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {mepData.holdings.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Holdings</h4>
                          {mepData.holdings.map((holding, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              • {holding.entity} ({holding.note})
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="pt-2 border-t">
                        <Link href={`/mep/${mepId}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            View Full Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Methodology</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We parse official Declarations of Members' Financial/Private Interests 
                and extract structured data about outside activities, support received, and holdings.
              </p>
              <Link href="/who-funds/methodology">
                <Button variant="outline" className="w-full">
                  Learn More
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
        {whoFundsData && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Last updated: {new Date(whoFundsData.meta.generatedAt).toLocaleDateString()} • 
              Sources: {whoFundsData.meta.sources.map(source => (
                <a key={source} href={source} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-1">
                  {source.split('//')[1]}
                </a>
              )).join(', ')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
