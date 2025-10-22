import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card'
import { Badge } from '@/components/shadcn/ui/badge'
import { RelatedLinks } from '@/components/RelatedLinks'
import { ArrowLeft, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import { getMEPStats, canIndex, getPSEOLimits, isPSEOEnabled, makeMeta, logPSEOGate } from '@/lib/pseo'
import { breadcrumbLd, itemListLd } from '@/lib/structured'

interface PartyPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PartyPageProps): Promise<Metadata> {
  const { slug } = await params
  const partyName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  // Get MEP data
  const mepStats = await getMEPStats()
  const limits = getPSEOLimits()
  const pseoEnabled = isPSEOEnabled()
  
  let shouldIndex = pseoEnabled
  let description = `MEPs from ${partyName} ranked by attendance in European Parliament roll-call votes`
  
  if (mepStats) {
    const partyMeps = mepStats.leaderboard.filter(mep => 
      mep.party?.toLowerCase().replace(/\s+/g, '-') === slug
    )
    
    const itemsCount = partyMeps.length
    
    // Apply quality gates
    shouldIndex = pseoEnabled && canIndex({
      minItems: limits.minItems,
      minWords: limits.minWords,
      wordsCount: 200, // Static content is sufficient
      itemsCount
    })
    
    if (!shouldIndex) {
      logPSEOGate(`party-${slug}`, 'Quality gate failed', {
        itemsCount,
        wordsCount: 200,
        minItems: limits.minItems,
        minWords: limits.minWords,
        pseoEnabled
      })
    }
    
    if (itemsCount > 0) {
      description = `Track ${itemsCount} MEPs from ${partyName} and their attendance in European Parliament roll-call votes. See rankings, voting records, and set up alerts.`
    }
  }

  const title = `${partyName} MEPs | Where's My MEP?`
  const canonical = `/party/${slug}`
  
  return makeMeta({
    title,
    desc: description,
    canonical
  })
}

export default async function PartyPage({ params }: PartyPageProps) {
  const { slug } = await params
  const partyName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  // Get MEP data
  const mepStats = await getMEPStats()
  const limits = getPSEOLimits()
  const pseoEnabled = isPSEOEnabled()
  
  if (!mepStats) {
    notFound()
  }
  
  const partyMeps = mepStats.leaderboard.filter(mep => 
    mep.party?.toLowerCase().replace(/\s+/g, '-') === slug
  )
  
  if (partyMeps.length === 0) {
    notFound()
  }
  
  const itemsCount = partyMeps.length
  const shouldIndex = pseoEnabled && canIndex({
    minItems: limits.minItems,
    minWords: limits.minWords,
    wordsCount: 200,
    itemsCount
  })
  
  // Generate JSON-LD if we pass quality gates
  let jsonLd = null
  if (shouldIndex) {
    const baseUrl = process.env.APP_URL || 'https://wheresmymep.eu'
    
    // Breadcrumb JSON-LD
    const breadcrumb = breadcrumbLd([
      { name: "Where's My MEP?", url: `${baseUrl}/` },
      { name: 'Parties', url: `${baseUrl}/leaderboard` },
      { name: partyName, url: `${baseUrl}/party/${slug}` }
    ])
    
    // Item List JSON-LD
    const itemList = itemListLd({
      name: `${partyName} MEPs`,
      items: partyMeps.slice(0, 10).map((mep, index) => ({
        position: index + 1,
        url: `${baseUrl}/mep/${mep.id}`,
        name: mep.name || 'Unknown MEP'
      }))
    })
    
    jsonLd = { breadcrumb, itemList }
  }
  
  // Get top MEPs for related links
  const topMeps = partyMeps.slice(0, 3).map(mep => ({
    id: mep.id,
    name: mep.name || 'Unknown MEP'
  }))

  return (
    <>
      {jsonLd && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.breadcrumb) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.itemList) }}
          />
        </>
      )}
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <Link href="/leaderboard" className="text-blue-600 hover:text-blue-800 flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Leaderboard</span>
              </Link>
              
              {!shouldIndex && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  pSEO (off)
                </Badge>
              )}
            </div>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Badge className="text-lg px-4 py-2">
                {partyName}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900">
                MEPs
              </h1>
            </div>
            
            <p className="text-lg text-gray-600 mb-4">
              Track {itemsCount} Members of the European Parliament from {partyName} and their attendance in roll-call votes over the last 180 days.
            </p>
            
            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{itemsCount} MEPs</span>
              </span>
              <span className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>Avg: {partyMeps.length > 0 ? (partyMeps.reduce((sum, mep) => sum + (mep.attendance || 0), 0) / partyMeps.length).toFixed(1) : 0}%</span>
              </span>
            </div>
          </div>

          {/* MEPs List */}
          <Card>
            <CardHeader>
              <CardTitle>MEPs by Attendance</CardTitle>
              <CardDescription>
                Ranked by attendance rate in roll-call votes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {partyMeps.map((mep, index) => (
                  <div key={mep.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 w-8">
                        #{index + 1}
                      </span>
                      <Link 
                        href={`/mep/${mep.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {mep.name || 'Unknown MEP'}
                      </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                      {mep.country && (
                        <span className="text-sm text-gray-500">
                          {mep.country}
                        </span>
                      )}
                      <span className="text-sm font-medium">
                        {mep.attendance?.toFixed(1) || 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Related Links */}
          <RelatedLinks 
            context="party" 
            data={{ 
              party: partyName,
              topMeps
            }} 
          />
        </main>
      </div>
    </>
  )
}


