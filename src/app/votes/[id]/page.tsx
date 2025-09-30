import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card'
import { Badge } from '@/components/shadcn/ui/badge'
import { ArrowLeft, Vote, Users, AlertTriangle } from 'lucide-react'
import { getPSEOLimits, isPSEOEnabled, makeMeta, logPSEOGate } from '@/lib/pseo'

interface VotePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: VotePageProps): Promise<Metadata> {
  const { id } = await params
  
  // For now, keep all vote pages as noindex until we have proper vote data
  const limits = getPSEOLimits()
  const pseoEnabled = isPSEOEnabled()
  
  // Always noindex for now - we don't have vote data yet
  logPSEOGate(`vote-${id}`, 'No vote data available', {
    itemsCount: 0,
    wordsCount: 0,
    minItems: limits.minItems,
    minWords: limits.minWords,
    pseoEnabled
  })

  return {
    title: `Vote ${id} | Where's My MEP?`,
    description: `Roll-call vote ${id} in the European Parliament`,
    robots: {
      index: false,
      follow: true
    }
  }
}

export default async function VotePage({ params }: VotePageProps) {
  const { id } = await params
  
  // For now, this is a stub page since we don't have vote data
  // In the future, this would:
  // 1. Fetch vote details from the votes API
  // 2. Show MEPs who voted for/against/abstained
  // 3. Show attendance statistics
  // 4. Allow setting vote-specific alerts

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/leaderboard" className="text-blue-600 hover:text-blue-800 flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Leaderboard</span>
            </Link>
            
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Vote className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Roll-Call Vote {id}
            </h1>
          </div>
          
          <p className="text-lg text-gray-600 mb-4">
            Detailed voting information for this European Parliament roll-call vote.
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Vote Details</span>
            </CardTitle>
            <CardDescription>
              Comprehensive voting information and MEP attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Vote Details Coming Soon
              </h3>
              <p className="text-gray-600 mb-4">
                We're working on adding detailed vote information including:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-6">
                <li>• MEPs who voted for, against, or abstained</li>
                <li>• Attendance statistics for this specific vote</li>
                <li>• Vote context and topic information</li>
                <li>• Set alerts for similar votes</li>
              </ul>
              <Link 
                href="/leaderboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                View MEP Leaderboard
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
