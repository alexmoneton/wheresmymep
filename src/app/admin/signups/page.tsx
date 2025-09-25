'use client';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';

interface Signup {
  email: string;
  country: string;
  signupDate: string;
  id: string;
}

function AdminSignupsContent() {

  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');

  useEffect(() => {
    fetchSignups();
  }, [selectedCountry]);

  const fetchSignups = async () => {
    try {
      setLoading(true);
      const url = selectedCountry 
        ? `/api/notifications/signup?country=${encodeURIComponent(selectedCountry)}`
        : '/api/notifications/signup';
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setSignups(data.signups);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch signups');
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCountries = () => {
    const countries = Array.from(new Set(signups.map(s => s.country))).sort();
    return countries;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading signups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Notification Signups
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Countries</option>
                  {getUniqueCountries().map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                Total signups: <span className="font-semibold">{signups.length}</span>
              </div>
            </div>
          </div>

          {signups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No signups found.</p>
            </div>
          ) : (
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
                  {signups.map((signup) => (
                    <tr key={signup.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {signup.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {signup.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(signup.signupDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSignupsPage() {
  // Prevent rendering during build time
  if (typeof window === 'undefined') {
    return <div>Loading...</div>;
  }

  return <AdminSignupsContent />;
}
