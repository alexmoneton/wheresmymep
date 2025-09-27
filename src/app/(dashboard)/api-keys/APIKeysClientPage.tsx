'use client';

import { useState, useEffect } from 'react';
import { APIKeyData } from '@/lib/api-keys';

interface APIKeysClientPageProps {
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
}

export default function APIKeysClientPage({ user }: APIKeysClientPageProps) {
  const [apiKeyData, setApiKeyData] = useState<APIKeyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAPIKey();
  }, []);

  const fetchAPIKey = async () => {
    try {
      const response = await fetch('/api/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeyData(data);
      } else if (response.status === 404) {
        setApiKeyData(null);
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAPIKey = async () => {
    setActionLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Default API Key',
          permissions: ['read'],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeyData(data);
        setShowKey(true);
        setMessage('API key created successfully! Store it securely - it will not be shown again.');
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      setMessage('Failed to create API key');
    } finally {
      setActionLoading(false);
    }
  };

  const regenerateAPIKey = async () => {
    if (!confirm('Are you sure you want to regenerate your API key? This will invalidate the current key.')) {
      return;
    }

    setActionLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/api-keys', {
        method: 'PUT',
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeyData(data);
        setShowKey(true);
        setMessage('API key regenerated successfully! Store it securely - it will not be shown again.');
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to regenerate API key');
      }
    } catch (error) {
      console.error('Error regenerating API key:', error);
      setMessage('Failed to regenerate API key');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteAPIKey = async () => {
    if (!confirm('Are you sure you want to delete your API key? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/api-keys', {
        method: 'DELETE',
      });

      if (response.ok) {
        setApiKeyData(null);
        setShowKey(false);
        setMessage('API key deleted successfully');
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      setMessage('Failed to delete API key');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API key...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-2 text-gray-600">
            Manage your API keys for programmatic access to MEP data.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('successfully') 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* API Key Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">API Key Status</h2>
              <p className="text-sm text-gray-600">
                {apiKeyData ? 'You have an active API key' : 'No API key found'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {apiKeyData ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* API Key Details */}
        {apiKeyData ? (
          <div className="space-y-6">
            {/* Key Display */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your API Key</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKeyData.key}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                    >
                      {showKey ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(apiKeyData.key)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{apiKeyData.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Permissions</label>
                    <p className="text-sm text-gray-900">{apiKeyData.permissions.join(', ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rate Limit</label>
                    <p className="text-sm text-gray-900">{apiKeyData.rateLimit.toLocaleString()} requests/hour</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-900">
                      {new Date(apiKeyData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="flex space-x-4">
                <button
                  onClick={regenerateAPIKey}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Regenerating...' : 'Regenerate Key'}
                </button>
                <button
                  onClick={deleteAPIKey}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Deleting...' : 'Delete Key'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Create API Key */
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create API Key</h3>
            <p className="text-sm text-gray-600 mb-6">
              Generate an API key to access MEP data programmatically. You'll be able to make requests to our REST API endpoints.
            </p>
            <button
              onClick={createAPIKey}
              disabled={actionLoading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'Creating...' : 'Create API Key'}
            </button>
          </div>
        )}

        {/* API Documentation */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">API Documentation</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Base URL</h4>
              <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {typeof window !== 'undefined' ? window.location.origin : 'https://wheresmymep.eu'}/api/v1
              </code>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Authentication</h4>
              <p className="text-sm text-gray-600 mb-2">
                Include your API key in the request headers:
              </p>
              <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded block">
                x-api-key: {apiKeyData ? apiKeyData.key.substring(0, 12) + '...' : 'your-api-key'}
              </code>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">Available Endpoints</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">GET /meps</code> - List all MEPs</li>
                <li><code className="bg-gray-100 px-1 rounded">GET /meps/{slug}</code> - Get specific MEP</li>
                <li><code className="bg-gray-100 px-1 rounded">GET /votes</code> - List votes</li>
                <li><code className="bg-gray-100 px-1 rounded">GET /rankings/attendance</code> - Attendance rankings</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">Rate Limits</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Free tier: 100 requests/hour</li>
                <li>Pro tier: 10,000 requests/hour</li>
                <li>Enterprise tier: 100,000 requests/hour</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

