'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface AnalyticsData {
  groupVariance: Array<{
    group: string
    variance: number
    average: number
    count: number
  }>
  seasonality: Array<{
    month: string
    average: number
    count: number
  }>
  ageGroups: Array<{
    ageGroup: string
    average: number
    count: number
  }>
  countryRankings: {
    topCountries: Array<{
      country: string
      average: number
      count: number
      meps: Array<{
        name: string
        attendance: number
      }>
    }>
    bottomCountries: Array<{
      country: string
      average: number
      count: number
      meps: Array<{
        name: string
        attendance: number
      }>
    }>
    allCountries: Array<{
      country: string
      average: number
      count: number
    }>
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <>
      <Tabs defaultValue="countries" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="countries">Country Rankings</TabsTrigger>
        <TabsTrigger value="groups">Group Variance</TabsTrigger>
        <TabsTrigger value="seasonality">Seasonality</TabsTrigger>
        <TabsTrigger value="age">Country Size</TabsTrigger>
      </TabsList>

      <TabsContent value="countries" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Countries */}
          <Card>
            <CardHeader>
              <CardTitle>🏆 Top Countries by Attendance</CardTitle>
              <CardDescription>
                Countries with the highest average MEP attendance rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.countryRankings.topCountries.map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-gray-600">#{index + 1}</div>
                      <div>
                        <div className="font-medium">{country.country}</div>
                        <div className="text-sm text-gray-500">{country.count} MEPs</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {country.average.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bottom Countries */}
          <Card>
            <CardHeader>
              <CardTitle>📉 Countries with Lowest Attendance</CardTitle>
              <CardDescription>
                Countries with the lowest average MEP attendance rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.countryRankings.bottomCountries.map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-gray-600">#{data.countryRankings.allCountries.length - index}</div>
                      <div>
                        <div className="font-medium">{country.country}</div>
                        <div className="text-sm text-gray-500">{country.count} MEPs</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {country.average.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Countries Chart */}
        <Card>
          <CardHeader>
            <CardTitle>All Countries Attendance Overview</CardTitle>
            <CardDescription>
              Complete ranking of all countries by average MEP attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.countryRankings.allCountries.slice(0, 20)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="country" type="category" width={120} />
                <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                <Bar dataKey="average" fill="#8884D8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="groups" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Political Group Attendance Variance</CardTitle>
            <CardDescription>
              Internal consistency of attendance within each political group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.groupVariance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="group" type="category" width={120} />
                <Tooltip formatter={(value) => [`${value}%`, 'Variance']} />
                <Bar dataKey="variance" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.groupVariance.map((group, index) => (
                <div key={group.group} className="p-4 border rounded-lg">
                  <div className="font-medium">{group.group}</div>
                  <div className="text-sm text-gray-600">
                    Variance: {group.variance.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Average: {group.average.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {group.count} MEPs
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="seasonality" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Attendance Patterns</CardTitle>
            <CardDescription>
              Monthly attendance patterns throughout the year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.seasonality}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                <Line type="monotone" dataKey="average" stroke="#8884D8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data.seasonality.map((month) => (
                <div key={month.month} className="text-center p-3 border rounded">
                  <div className="font-medium">{month.month}</div>
                  <div className="text-lg font-bold text-blue-600">
                    {month.average.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {month.count} sessions
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="age" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance by Country Size</CardTitle>
            <CardDescription>
              How attendance varies across countries of different sizes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.ageGroups}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ageGroup" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                  <Bar dataKey="average" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
              
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.ageGroups}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ ageGroup, average }) => `${ageGroup}: ${average.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884D8"
                    dataKey="average"
                  >
                    {data.ageGroups.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.ageGroups.map((ageGroup, index) => (
                <div key={ageGroup.ageGroup} className="p-4 border rounded-lg">
                  <div className="font-medium">{ageGroup.ageGroup}</div>
                  <div className="text-lg font-bold text-blue-600">
                    {ageGroup.average.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {ageGroup.count} MEPs
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    
    {/* Footer with Twitter link */}
    <div className="mt-12 pt-8 border-t border-gray-200 text-center">
      <p className="text-sm text-gray-600">
        Analytics by{' '}
        <a 
          href="https://twitter.com/alexmoneton" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          @alexmoneton
        </a>
        {' • '}
        <a 
          href="https://www.linkedin.com/in/alexmoneton/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          LinkedIn
        </a>
      </p>
    </div>
    </>
  )
}
