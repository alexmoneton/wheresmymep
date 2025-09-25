import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'MEP Leaderboard | Where\'s My MEP?',
  description: 'View attendance rankings and performance metrics for Members of the European Parliament',
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            MEP Leaderboard
          </h1>
          <p className="text-gray-600">
            This page is currently under maintenance. Please check back later.
          </p>
        </div>
      </div>
    </div>
  );
}