import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Committees | Where\'s My MEP?',
  description: 'Explore parliamentary committees and their members in the European Parliament',
};

export default function CommitteesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Committees
          </h1>
          <p className="text-gray-600">
            This page is currently under maintenance. Please check back later.
          </p>
        </div>
      </div>
    </div>
  );
}