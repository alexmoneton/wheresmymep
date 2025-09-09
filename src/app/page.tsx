'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Remove server-side data imports for client component
import CountryFlag from '@/components/CountryFlag';
import PartyBadge from '@/components/PartyBadge';
import SpecialRoleBadge from '@/components/SpecialRoleBadge';

interface MEP {
  id: string;
  name: string;
  country: string;
  party: string;
  attendance_pct: number;
  special_role?: string;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MEP[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  
  const [topMEPs, setTopMEPs] = useState<MEP[]>([]);
  const [bottomMEPs, setBottomMEPs] = useState<MEP[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // Notification signup state
  const [selectedCountry, setSelectedCountry] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Get unique countries for dropdown
  const [countries, setCountries] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/meps');
        const meps = await response.json();
        const uniqueCountries = Array.from(new Set(meps.map((mep: MEP) => mep.country))).sort() as string[];
        setCountries(uniqueCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  }, []);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard?limit=10');
        const data = await response.json();
        setTopMEPs(data.top);
        setBottomMEPs(data.bottom);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
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

  // Handle notification signup
  const handleNotificationSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry || !email) {
      setSubmitMessage('Please select a country and enter your email');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/notifications/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          country: selectedCountry
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage('✅ ' + data.message);
        setEmail('');
        setSelectedCountry('');
      } else {
        setSubmitMessage('❌ ' + data.error);
      }
    } catch {
      setSubmitMessage('❌ Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Where&apos;s My MEP?
            </h1>
            <p className="text-lg text-gray-600">
              Attendance in roll-call votes, last 180 days
            </p>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Search MEPs
          </h2>
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name or country..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
              <Link
                href="/leaderboard"
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                View All
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
                      <CountryFlag country={mep.country} className="text-lg" />
                      <div>
                        <div className="font-medium text-gray-900">{mep.name}</div>
                        <div className="text-sm text-gray-600">{mep.country}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-blue-600">
                        {mep.attendance_pct}%
                      </div>
                      <PartyBadge party={mep.party} />
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

        {/* Leaderboard Preview */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top 10 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Top 10 Attendance
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Highest attendance rates
              </p>
            </div>
            <div className="p-6">
              {loadingLeaderboard ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {topMEPs.map((mep: MEP, index: number) => (
                  <div
                    key={mep.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {index + 1}
                      </span>
                      <CountryFlag country={mep.country} className="text-lg" />
                      <div>
                        <Link
                          href={`/mep/${mep.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {mep.name}
                        </Link>
                        <p className="text-sm text-gray-600">{mep.country}</p>
                        {mep.special_role && (
                          <div className="mt-1">
                            <SpecialRoleBadge role={mep.special_role} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        {mep.special_role ? 'N/A' : `${mep.attendance_pct}%`}
                      </div>
                      <PartyBadge party={mep.party} />
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom 10 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Bottom 10 Attendance
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Lowest attendance rates
              </p>
            </div>
            <div className="p-6">
              {loadingLeaderboard ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {bottomMEPs.map((mep: MEP, index: number) => (
                  <div
                    key={mep.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {index + 1}
                      </span>
                      <CountryFlag country={mep.country} className="text-lg" />
                      <div>
                        <Link
                          href={`/mep/${mep.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {mep.name}
                        </Link>
                        <p className="text-sm text-gray-600">{mep.country}</p>
                        {mep.special_role && (
                          <div className="mt-1">
                            <SpecialRoleBadge role={mep.special_role} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-red-600">
                        {mep.special_role ? 'N/A' : `${mep.attendance_pct}%`}
                      </div>
                      <PartyBadge party={mep.party} />
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Notification Signup */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Stay Informed
        </h3>
        <form onSubmit={handleNotificationSignup} className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-base font-medium text-blue-800">
              Notify me when my politician stops showing up for work
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              required
            />
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitting ? 'Signing up...' : 'Notify me!'}
            </button>
          </div>
        </form>
        
        {submitMessage && (
          <div className={`mt-3 text-center text-sm ${
            submitMessage.startsWith('✅') ? 'text-green-700' : 
            submitMessage.startsWith('❌') ? 'text-red-700' : 
            'text-blue-700'
          }`}>
            {submitMessage}
          </div>
        )}
      </div>

      {/* Methodology */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Methodology
          </h3>
          <p className="text-sm text-blue-800">
            Attendance is calculated based on roll-call votes in the European Parliament over the last 180 days. 
            Abstaining counts as present; not voting counts as absent. Some MEPs may have partial terms 
            affecting their attendance percentage.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>
              Data source: HowTheyVote.eu • European Parliament roll-call votes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}