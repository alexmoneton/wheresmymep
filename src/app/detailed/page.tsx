import { Metadata } from 'next'
import AnalyticsClient from './AnalyticsClient'

export const metadata: Metadata = {
  title: 'Detailed Analytics - Where\'s My MEP',
  description: 'Detailed analytics and insights for MEP attendance patterns',
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Internal insights and patterns in MEP attendance data
          </p>
        </div>
        
        <AnalyticsClient />
      </div>
    </div>
  )
}
