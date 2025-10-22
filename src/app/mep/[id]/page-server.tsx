import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CountryFlag from '@/components/CountryFlag'
import PartyBadge from '@/components/PartyBadge'
import SpecialRoleBadge from '@/components/SpecialRoleBadge'
import { CreateAlertModal } from '@/components/CreateAlertModal'
import { ExportCSVButton } from '@/components/ExportCSVButton'
import { RelatedLinks } from '@/components/RelatedLinks'
import { Bell, Download, ArrowLeft } from 'lucide-react'
import { makeMeta } from '@/lib/pseo'
import { copyForMEP } from '@/lib/pseo-copy'
import { personLd } from '@/lib/structured'

interface MEP {
  mep_id: string | null
  name: string
  country: string
  party: string
  national_party: string
  profile_url?: string
  photo_url?: string
  votes_total_period?: number
  votes_cast?: number
  attendance_pct?: number
  partial_term?: boolean
  special_role?: string
  sick_leave?: boolean
}

interface NotableVote {
  mep_id: string
  vote_id: string
  vote_date: string
  title: string
  result?: string
  vote_position: 'For' | 'Against' | 'Abstain' | 'Not voting'
  total_for?: number
  total_against?: number
  total_abstain?: number
  source_url: string
}

interface MEPPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: MEPPageProps): Promise<Metadata> {
  const { id } = await params
  
  try {
    const response = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/meps/${id}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return {
        title: 'MEP not found',
        robots: { index: false, follow: false }
      }
    }
    
    const mep: MEP = await response.json()
    
    // Generate copy for SEO
    const generatedCopy = copyForMEP({
      name: mep.name,
      attendance: mep.attendance_pct,
      country: mep.country,
      party: mep.party,
      votesCast: mep.votes_cast,
      totalVotes: mep.votes_total_period
    })
    
    const title = `${mep.name} | MEP Profile | Where's My MEP?`
    const description = generatedCopy.substring(0, 160) + (generatedCopy.length > 160 ? '...' : '')
    const canonical = `/mep/${id}`
    
    return makeMeta({
      title,
      desc: description,
      canonical
    })
  } catch (error) {
    return {
      title: 'MEP not found',
      robots: { index: false, follow: false }
    }
  }
}

export default async function MEPProfilePage({ params }: MEPPageProps) {
  const { id } = await params
  
  let mep: MEP
  let notableVotes: NotableVote[] = []
  
  try {
    // Fetch MEP data
    const mepResponse = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/meps/${id}`, {
      cache: 'no-store'
    })
    
    if (!mepResponse.ok) {
      notFound()
    }
    
    mep = await mepResponse.json()
    
    // Fetch notable votes
    try {
      const votesResponse = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/meps/${id}/notable`, {
        cache: 'no-store'
      })
      
      if (votesResponse.ok) {
        notableVotes = await votesResponse.json()
      }
    } catch (error) {
      console.warn('Failed to fetch notable votes:', error)
    }
  } catch (error) {
    notFound()
  }
  
  // Generate copy for the page
  const generatedCopy = copyForMEP({
    name: mep.name,
    attendance: mep.attendance_pct,
    country: mep.country,
    party: mep.party,
    votesCast: mep.votes_cast,
    totalVotes: mep.votes_total_period
  })
  
  // Generate JSON-LD
  const baseUrl = process.env.APP_URL || 'https://wheresmymep.eu'
  const person = personLd({
    name: mep.name,
    jobTitle: 'Member of the European Parliament',
    worksFor: 'European Parliament',
    address: {
      addressCountry: mep.country
    },
    sameAs: mep.profile_url ? [mep.profile_url] : undefined,
    additionalProperty: [
      {
        name: 'Attendance Percentage',
        value: mep.attendance_pct || 0
      },
      {
        name: 'Political Party',
        value: mep.party
      },
      {
        name: 'National Party',
        value: mep.national_party
      }
    ]
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link href="/leaderboard" className="text-blue-600 hover:text-blue-800 flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Leaderboard</span>
            </Link>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* MEP Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-start space-x-6">
              {mep.photo_url ? (
                <img
                  src={mep.photo_url}
                  alt={mep.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl text-gray-400">👤</span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{mep.name}</h1>
                  {mep.special_role && (
                    <SpecialRoleBadge role={mep.special_role} />
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <CountryFlag country={mep.country} />
                    <span className="text-gray-600">{mep.country}</span>
                  </div>
                  <PartyBadge party={mep.party} />
                </div>
                
                <p className="text-gray-600 text-sm">
                  {generatedCopy}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance Rate</h3>
              <div className="text-3xl font-bold text-blue-600">
                {mep.attendance_pct?.toFixed(1) || 0}%
              </div>
              <p className="text-sm text-gray-500 mt-1">Last 180 days</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Votes Cast</h3>
              <div className="text-3xl font-bold text-green-600">
                {mep.votes_cast || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                of {mep.votes_total_period || 0} total votes
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
              <div className="text-lg font-medium">
                {mep.sick_leave ? (
                  <span className="text-orange-600">On Sick Leave</span>
                ) : mep.partial_term ? (
                  <span className="text-yellow-600">Partial Term</span>
                ) : (
                  <span className="text-green-600">Active</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="flex flex-wrap gap-4">
              <CreateAlertModal
                trigger={
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <Bell className="h-4 w-4 mr-2" />
                    Set Alert
                  </button>
                }
                prefilledTopic={`MEP ${mep.name}`}
              />
              
              <ExportCSVButton
                data={[mep]}
                filename={`mep-${mep.mep_id}-attendance.csv`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </ExportCSVButton>
            </div>
          </div>

          {/* Notable Votes */}
          {notableVotes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notable Votes</h3>
              <div className="space-y-4">
                {notableVotes.slice(0, 5).map((vote, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 flex-1">
                        {vote.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        vote.vote_position === 'For' ? 'bg-green-100 text-green-800' :
                        vote.vote_position === 'Against' ? 'bg-red-100 text-red-800' :
                        vote.vote_position === 'Abstain' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {vote.vote_position}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{new Date(vote.vote_date).toLocaleDateString()}</span>
                      {vote.result && (
                        <span>Result: {vote.result}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Related Links */}
          <RelatedLinks 
            context="mep" 
            data={{ 
              mepId: mep.mep_id || id,
              mepName: mep.name,
              country: mep.country,
              party: mep.party,
              recentVotes: notableVotes.slice(0, 2).map(vote => ({
                id: vote.vote_id,
                title: vote.title
              }))
            }} 
          />
        </main>
      </div>
    </>
  )
}


