export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Where's My MEP?
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Track attendance rates and voting records of Members of the European Parliament
          </p>
          <p className="text-gray-600">
            This site is currently under maintenance. Please check back later.
          </p>
        </div>
      </div>
    </div>
  );
}