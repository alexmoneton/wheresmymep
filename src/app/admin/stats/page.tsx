'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card'
import { Badge } from '@/components/shadcn/ui/badge'

interface DailyStat {
  date: string
  count: number
}

interface StatsData {
  totals: {
    alerts_created: { last7days: number; last30days: number }
    csv_exported: { last7days: number; last30days: number }
    billing_interest: { last7days: number; last30days: number }
  }
  daily: {
    alerts_created: { last7days: DailyStat[]; last30days: DailyStat[] }
    csv_exported: { last7days: DailyStat[]; last30days: DailyStat[] }
    billing_interest: { last7days: DailyStat[]; last30days: DailyStat[] }
  }
  generated_at: string
}

function AdminStatsContent() {
  const searchParams = useSearchParams()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    const key = searchParams.get('key')
    
    if (!key) {
      setUnauthorized(true)
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/admin/stats?key=${encodeURIComponent(key)}`)
        
        if (response.status === 401) {
          setUnauthorized(true)
          return
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stats...</p>
        </div>
      </div>
    )
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
          <p className="text-gray-600 mb-4">
            Access to admin stats requires a valid key.
          </p>
          <p className="text-sm text-gray-500">
            Add <code className="bg-gray-100 px-2 py-1 rounded">?key=YOUR_SECRET</code> to the URL.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Data</h1>
          <p className="text-gray-600">No stats data available.</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const StatCard = ({ 
    title, 
    description, 
    last7days, 
    last30days, 
    color = 'blue' 
  }: {
    title: string
    description: string
    last7days: number
    last30days: number
    color?: 'blue' | 'green' | 'purple'
  }) => {
    const colorClasses = {
      blue: 'border-blue-200 bg-blue-50',
      green: 'border-green-200 bg-green-50',
      purple: 'border-purple-200 bg-purple-50',
    }

    return (
      <Card className={colorClasses[color]}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">{last7days}</div>
              <div className="text-sm text-gray-600">Last 7 days</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{last30days}</div>
              <div className="text-sm text-gray-600">Last 30 days</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const DailyChart = ({ 
    title, 
    data, 
    color = 'blue' 
  }: {
    title: string
    data: DailyStat[]
    color?: 'blue' | 'green' | 'purple'
  }) => {
    const maxCount = Math.max(...data.map(d => d.count), 1)
    
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.map((day) => (
              <div key={day.date} className="flex items-center space-x-3">
                <div className="w-16 text-sm text-gray-600">
                  {formatDate(day.date)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`h-4 ${colorClasses[color]} rounded`}
                      style={{ 
                        width: `${(day.count / maxCount) * 100}%`,
                        minWidth: day.count > 0 ? '4px' : '0px'
                      }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {day.count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Stats</h1>
          <p className="text-gray-600">
            Usage statistics and metrics for Where&apos;s My MEP
          </p>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              Generated: {new Date(stats.generated_at).toLocaleString()}
            </Badge>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Alerts Created"
            description="Users creating alert subscriptions"
            last7days={stats.totals.alerts_created.last7days}
            last30days={stats.totals.alerts_created.last30days}
            color="blue"
          />
          <StatCard
            title="CSV Exports"
            description="Data export downloads"
            last7days={stats.totals.csv_exported.last7days}
            last30days={stats.totals.csv_exported.last30days}
            color="green"
          />
          <StatCard
            title="Billing Interest"
            description="Users interested in Pro features"
            last7days={stats.totals.billing_interest.last7days}
            last30days={stats.totals.billing_interest.last30days}
            color="purple"
          />
        </div>

        {/* Daily Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <DailyChart
            title="Alerts Created (Last 7 Days)"
            data={stats.daily.alerts_created.last7days}
            color="blue"
          />
          <DailyChart
            title="CSV Exports (Last 7 Days)"
            data={stats.daily.csv_exported.last7days}
            color="green"
          />
          <DailyChart
            title="Billing Interest (Last 7 Days)"
            data={stats.daily.billing_interest.last7days}
            color="purple"
          />
          <DailyChart
            title="All Metrics (Last 7 Days)"
            data={stats.daily.alerts_created.last7days.map((day, index) => ({
              date: day.date,
              count: day.count + 
                     stats.daily.csv_exported.last7days[index].count + 
                     stats.daily.billing_interest.last7days[index].count
            }))}
            color="blue"
          />
        </div>
      </div>
    </div>
  )
}

export default function AdminStatsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AdminStatsContent />
    </Suspense>
  )
}
