'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Download, ExternalLink, Users, Calendar, Filter, Copy, AlertCircle } from 'lucide-react';

interface VoteResult {
  vote_id: string;
  dossier_id: string;
  dossier_title: string;
  date: string;
  mep_id: string;
  mep_name: string;
  group: string;
  country: string;
  party: string;
  outcome: string;
  majority_outcome: string;
  ep_source_url: string;
  leadership_role: boolean;
  role_note?: string;
}

interface VoteSearchResponse {
  items: VoteResult[];
  page: number;
  page_size: number;
  total: number;
  export_url: string;
  too_large?: boolean;
}

interface Filters {
  q: string;
  dossier_id: string;
  date_from: string;
  date_to: string;
  group: string;
  country: string;
  party: string;
  mep_id: string;
  outcome: string;
}

const GROUPS = [
  { value: 'EPP', label: 'European People\'s Party (EPP)' },
  { value: 'S&D', label: 'Progressive Alliance of Socialists and Democrats (S&D)' },
  { value: 'RE', label: 'Renew Europe (RE)' },
  { value: 'Greens/EFA', label: 'Greens/European Free Alliance (Greens/EFA)' },
  { value: 'ECR', label: 'European Conservatives and Reformists (ECR)' },
  { value: 'ID', label: 'Identity and Democracy (ID)' },
  { value: 'Left', label: 'The Left in the European Parliament (GUE/NGL)' },
  { value: 'Patriots', label: 'The Patriots for Europe (PfE)' },
  { value: 'ESN', label: 'Europe of Sovereign Nations (ESN)' },
  { value: 'NI', label: 'Non-attached (NI)' }
];

const COUNTRIES = [
  { value: 'DE', label: '🇩🇪 Germany' },
  { value: 'FR', label: '🇫🇷 France' },
  { value: 'IT', label: '🇮🇹 Italy' },
  { value: 'ES', label: '🇪🇸 Spain' },
  { value: 'PL', label: '🇵🇱 Poland' },
  { value: 'RO', label: '🇷🇴 Romania' },
  { value: 'NL', label: '🇳🇱 Netherlands' },
  { value: 'BE', label: '🇧🇪 Belgium' },
  { value: 'GR', label: '🇬🇷 Greece' },
  { value: 'CZ', label: '🇨🇿 Czech Republic' },
  { value: 'SE', label: '🇸🇪 Sweden' },
  { value: 'PT', label: '🇵🇹 Portugal' },
  { value: 'HU', label: '🇭🇺 Hungary' },
  { value: 'AT', label: '🇦🇹 Austria' },
  { value: 'BG', label: '🇧🇬 Bulgaria' },
  { value: 'DK', label: '🇩🇰 Denmark' },
  { value: 'FI', label: '🇫🇮 Finland' },
  { value: 'SK', label: '🇸🇰 Slovakia' },
  { value: 'IE', label: '🇮🇪 Ireland' },
  { value: 'HR', label: '🇭🇷 Croatia' },
  { value: 'LT', label: '🇱🇹 Lithuania' },
  { value: 'SI', label: '🇸🇮 Slovenia' },
  { value: 'LV', label: '🇱🇻 Latvia' },
  { value: 'EE', label: '🇪🇪 Estonia' },
  { value: 'CY', label: '🇨🇾 Cyprus' },
  { value: 'LU', label: '🇱🇺 Luxembourg' },
  { value: 'MT', label: '🇲🇹 Malta' }
];

const OUTCOMES = [
  { value: 'For', label: 'For' },
  { value: 'Against', label: 'Against' },
  { value: 'Abstain', label: 'Abstain' },
  { value: 'Not voting', label: 'Not voting' }
];

function VoteExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<Filters>({
    q: '',
    dossier_id: '',
    date_from: '',
    date_to: '',
    group: '',
    country: '',
    party: '',
    mep_id: '',
    outcome: ''
  });
  
  const [results, setResults] = useState<VoteSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Parse URL parameters on load
  useEffect(() => {
    const newFilters: Filters = {
      q: searchParams.get('q') || '',
      dossier_id: searchParams.get('dossier_id') || '',
      date_from: searchParams.get('date_from') || '',
      date_to: searchParams.get('date_to') || '',
      group: searchParams.get('group') || '',
      country: searchParams.get('country') || '',
      party: searchParams.get('party') || '',
      mep_id: searchParams.get('mep_id') || '',
      outcome: searchParams.get('outcome') || ''
    };
    
    setFilters(newFilters);
    
    // If there are any filters, search immediately
    const hasFilters = Object.values(newFilters).some(value => value !== '');
    if (hasFilters) {
      searchVotes(newFilters);
    }
  }, [searchParams]);

  const searchVotes = useCallback(async (searchFilters: Filters) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });
      
      const response = await fetch(`/api/votes/search?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }
      
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApplyFilters = () => {
    // Update URL with current filters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    router.push(`/vote-explorer?${params.toString()}`);
    searchVotes(filters);
  };

  const handleResetFilters = () => {
    const emptyFilters: Filters = {
      q: '',
      dossier_id: '',
      date_from: '',
      date_to: '',
      group: '',
      country: '',
      party: '',
      mep_id: '',
      outcome: ''
    };
    
    setFilters(emptyFilters);
    router.push('/vote-explorer');
    setResults(null);
  };

  const handleCopyLink = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    const url = `${window.location.origin}/vote-explorer?${params.toString()}`;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  const handleExportCSV = async () => {
    if (!results?.export_url) return;
    
    try {
      const response = await fetch(results.export_url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vote_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vote Explorer</h1>
              <p className="text-gray-600 mt-1">
                Filter per-MEP vote rows from official EP roll-calls. Use Export CSV to drop results into briefs.
              </p>
            </div>
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to MEPs
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showFilters ? 'Hide' : 'Show'} filters
            </button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Keyword search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keyword (dossier title)
                </label>
                <input
                  type="text"
                  value={filters.q}
                  onChange={(e) => updateFilter('q', e.target.value)}
                  placeholder="Search in dossier titles..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date from
                </label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => updateFilter('date_from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date to
                </label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => updateFilter('date_to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Political Group
                </label>
                <select
                  value={filters.group}
                  onChange={(e) => updateFilter('group', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All groups</option>
                  {GROUPS.map(group => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  value={filters.country}
                  onChange={(e) => updateFilter('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All countries</option>
                  {COUNTRIES.map(country => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Party */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National Party
                </label>
                <input
                  type="text"
                  value={filters.party}
                  onChange={(e) => updateFilter('party', e.target.value)}
                  placeholder="Exact match"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* MEP ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MEP ID
                </label>
                <input
                  type="text"
                  value={filters.mep_id}
                  onChange={(e) => updateFilter('mep_id', e.target.value)}
                  placeholder="Specific MEP ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Outcome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vote Outcome
                </label>
                <select
                  value={filters.outcome}
                  onChange={(e) => updateFilter('outcome', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All outcomes</option>
                  {OUTCOMES.map(outcome => (
                    <option key={outcome.value} value={outcome.value}>
                      {outcome.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Apply filters'}
            </button>
            
            <button
              onClick={handleResetFilters}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Reset
            </button>
            
            <button
              onClick={handleCopyLink}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy link
            </button>
            
            {results && (
              <button
                onClick={handleExportCSV}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            )}
          </div>

          {/* Note about leadership roles */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Leadership roles may preside rather than vote; see role badge.
            </p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Results ({results.total.toLocaleString()} votes)
                </h2>
                {results.too_large && (
                  <div className="flex items-center text-orange-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Large dataset - consider narrowing filters</span>
                  </div>
                )}
              </div>
            </div>

            {results.items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No votes found matching your criteria.</p>
                <p className="text-sm mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dossier Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          MEP
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Group
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Country
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Party
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Outcome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Majority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.items.map((vote, index) => (
                        <tr key={`${vote.vote_id}-${vote.mep_id}-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(vote.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={vote.dossier_title}>
                              {vote.dossier_title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <span>{vote.mep_name}</span>
                              {vote.leadership_role && (
                                <span 
                                  className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  title="Leadership role (may preside rather than vote)"
                                >
                                  VP
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {vote.group}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {vote.country}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {vote.party}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              vote.outcome === 'For' ? 'bg-green-100 text-green-800' :
                              vote.outcome === 'Against' ? 'bg-red-100 text-red-800' :
                              vote.outcome === 'Abstain' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {vote.outcome}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {vote.majority_outcome}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <a
                              href={vote.ep_source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((results.page - 1) * results.page_size) + 1} to {Math.min(results.page * results.page_size, results.total)} of {results.total.toLocaleString()} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">Page size:</span>
                      <select
                        value={results.page_size}
                        onChange={(e) => {
                          const newPageSize = parseInt(e.target.value);
                          const params = new URLSearchParams(window.location.search);
                          params.set('page_size', newPageSize.toString());
                          params.set('page', '1');
                          router.push(`/vote-explorer?${params.toString()}`);
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Empty state */}
        {!results && !loading && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No search performed</h3>
            <p className="text-gray-500">Use the filters above to search for votes.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function VoteExplorer() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Vote Explorer...</p>
        </div>
      </div>
    }>
      <VoteExplorerContent />
    </Suspense>
  );
}
