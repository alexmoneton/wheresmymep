import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation | Where\'s My MEP?',
  description: 'Complete API documentation for accessing MEP data programmatically.',
};

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
          <p className="mt-2 text-gray-600">
            Access European Parliament data programmatically with our REST API.
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Start</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">1. Get an API Key</h3>
              <p className="text-sm text-gray-600">
                Sign up and create an API key from your dashboard.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">2. Make a Request</h3>
              <div className="bg-gray-100 rounded-md p-4 mt-2">
                <pre className="text-sm text-gray-800">
{`curl -H "x-api-key: your-api-key" \\
  "https://wheresmymep.eu/api/v1/meps"`}
                </pre>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">3. Get Data</h3>
              <p className="text-sm text-gray-600">
                Receive structured JSON responses with MEP data, votes, and rankings.
              </p>
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication</h2>
          <p className="text-gray-600 mb-4">
            All API requests require an API key. Include it in the request headers:
          </p>
          <div className="bg-gray-100 rounded-md p-4">
            <pre className="text-sm text-gray-800">
{`x-api-key: wmm_your_api_key_here`}
            </pre>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rate Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Free</h3>
              <p className="text-2xl font-bold text-blue-600">100</p>
              <p className="text-sm text-gray-600">requests/hour</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Pro</h3>
              <p className="text-2xl font-bold text-green-600">10,000</p>
              <p className="text-sm text-gray-600">requests/hour</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Enterprise</h3>
              <p className="text-2xl font-bold text-purple-600">100,000</p>
              <p className="text-sm text-gray-600">requests/hour</p>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Endpoints</h2>
          
          {/* MEPs */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">MEPs</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">GET</span>
                  <code className="text-sm font-mono">/api/v1/meps</code>
                </div>
                <p className="text-sm text-gray-600 mb-2">Get all MEPs with optional filtering</p>
                <div className="bg-gray-100 rounded-md p-3">
                  <pre className="text-xs text-gray-800">
{`Query Parameters:
- country: Filter by country code (e.g., "DE", "FR")
- party: Filter by political group (e.g., "EPP", "S&D")
- committee: Filter by committee code (e.g., "AFET", "ENVI")
- limit: Number of results (max 100, default 50)
- offset: Pagination offset (default 0)
- sortBy: Sort field (lastName, attendance, votes)
- sortOrder: Sort direction (asc, desc)`}
                  </pre>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">GET</span>
                  <code className="text-sm font-mono">/api/v1/meps/&#123;slug&#125;</code>
                </div>
                <p className="text-sm text-gray-600">Get specific MEP by slug with detailed information</p>
              </div>
            </div>
          </div>

          {/* Votes */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Votes</h3>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">GET</span>
                <code className="text-sm font-mono">/api/v1/votes</code>
              </div>
              <p className="text-sm text-gray-600 mb-2">Get votes with optional filtering</p>
              <div className="bg-gray-100 rounded-md p-3">
                <pre className="text-xs text-gray-800">
{`Query Parameters:
- dateFrom: Start date (ISO format)
- dateTo: End date (ISO format)
- dossierId: Filter by dossier ID
- limit: Number of results (max 100, default 50)
- offset: Pagination offset (default 0)
- sortBy: Sort field (date, title)
- sortOrder: Sort direction (asc, desc)`}
                </pre>
              </div>
            </div>
          </div>

          {/* Rankings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rankings</h3>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">GET</span>
                <code className="text-sm font-mono">/api/v1/rankings/attendance</code>
              </div>
              <p className="text-sm text-gray-600 mb-2">Get attendance rankings</p>
              <div className="bg-gray-100 rounded-md p-3">
                <pre className="text-xs text-gray-800">
{`Query Parameters:
- country: Filter by country code
- party: Filter by political group
- limit: Number of results (max 100, default 50)
- offset: Pagination offset (default 0)
- sortOrder: Sort direction (asc, desc)`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Response Format */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Response Format</h2>
          <p className="text-gray-600 mb-4">
            All responses are in JSON format with the following structure:
          </p>
          <div className="bg-gray-100 rounded-md p-4">
            <pre className="text-sm text-gray-800">
{`{
  "data": [...],
  "pagination": {
    "total": 714,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0"
  }
}`}
            </pre>
          </div>
        </div>

        {/* Error Handling */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Error Handling</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">401 Unauthorized</h3>
              <p className="text-sm text-gray-600">Invalid or missing API key</p>
              <div className="bg-gray-100 rounded-md p-3 mt-2">
                <pre className="text-xs text-gray-800">
{`{
  "error": "Invalid API key"
}`}
                </pre>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">429 Too Many Requests</h3>
              <p className="text-sm text-gray-600">Rate limit exceeded</p>
              <div className="bg-gray-100 rounded-md p-3 mt-2">
                <pre className="text-xs text-gray-800">
{`{
  "error": "Rate limit exceeded",
  "limit": 100,
  "remaining": 0,
  "reset": "2024-01-15T11:30:00Z"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* SDKs and Libraries */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">SDKs and Libraries</h2>
          <p className="text-gray-600 mb-4">
            We're working on official SDKs for popular programming languages. For now, you can use any HTTP client.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900">JavaScript/Node.js</h3>
              <div className="bg-gray-100 rounded-md p-3 mt-2">
                <pre className="text-xs text-gray-800">
{`const response = await fetch(
  'https://wheresmymep.eu/api/v1/meps',
  {
    headers: {
      'x-api-key': 'your-api-key'
    }
  }
);
const data = await response.json();`}
                </pre>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Python</h3>
              <div className="bg-gray-100 rounded-md p-3 mt-2">
                <pre className="text-xs text-gray-800">
{`import requests

response = requests.get(
  'https://wheresmymep.eu/api/v1/meps',
  headers={'x-api-key': 'your-api-key'}
)
data = response.json()`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

