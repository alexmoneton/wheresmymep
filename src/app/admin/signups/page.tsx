'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Signup {
  email: string;
  country: string;
  signupDate: string;
  id: string;
}

export default function AdminSignupsPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    fetchSignups();
  }, [selectedCountry]);

  const fetchSignups = async () => {
    try {
      setLoading(true);
      const url = selectedCountry 
        ? `/api/admin/signups?country=${encodeURIComponent(selectedCountry)}`
        : '/api/admin/signups';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setSignups(data.signups);
        setCountries(data.countries || []);
      } else {
        setError(data.error || 'Failed to fetch signups');
      }
    } catch (err) {
      setError('Failed to fetch signups');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Admin Signups
          </h1>
          
          {/* Filter by Country */}
          <div className="mb-6">
            <label htmlFor="country-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Country:
            </label>
            <select
              id="country-filter"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Summary</h2>
            <p className="text-blue-800">
              Total signups: <strong>{signups.length}</strong>
              {selectedCountry && (
                <span> for {selectedCountry}</span>
              )}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading signups...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Signups Table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signup Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {signups.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        No signups found{selectedCountry && ` for ${selectedCountry}`}.
                      </td>
                    </tr>
                  ) : (
                    signups.map((signup) => (
                      <tr key={signup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {signup.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {signup.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(signup.signupDate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}