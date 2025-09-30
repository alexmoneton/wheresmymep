import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card'
import { Badge } from '@/components/shadcn/ui/badge'
import { RelatedLinks } from '@/components/RelatedLinks'
import { ArrowLeft, Calendar, FileText, AlertTriangle } from 'lucide-react'
import { getEARBundle, canIndex, getPSEOLimits, isPSEOEnabled, makeMeta, logPSEOGate } from '@/lib/pseo'
import { copyForWeek, ensureMinWords } from '@/lib/pseo-copy'
import { breadcrumbLd, newsArticleLd } from '@/lib/structured'

interface WeekPageProps {
  params: Promise<{ week: string }>
}

export async function generateMetadata({ params }: WeekPageProps): Promise<Metadata> {
  const { week } = await params
  
  // Get pSEO data
  const bundle = await getEARBundle()
  const limits = getPSEOLimits()
  const pseoEnabled = isPSEOEnabled()
  
  let shouldIndex = pseoEnabled
  let description = `Weekly AI Act updates for ${week}`
  
  if (bundle && bundle.week === week) {
    const itemsCount = bundle.items.length
    
    // Generate copy and check word count
    const generatedCopy = copyForWeek(bundle)
    const { text: finalCopy, isThin } = ensureMinWords(generatedCopy, limits.minWords)
    const wordsCount = finalCopy.trim().split(/\s+/).length
    
    // Apply quality gates
    shouldIndex = pseoEnabled && canIndex({
      minItems: limits.minItems,
      minWords: limits.minWords,
      wordsCount,
      itemsCount
    })
    
    if (!shouldIndex) {
      logPSEOGate(`week-${week}`, 'Quality gate failed', {
        itemsCount,
        wordsCount,
        minItems: limits.minItems,
        minWords: limits.minWords,
        pseoEnabled
      })
    }
    
    // Use generated copy if we have enough content
    if (itemsCount >= limits.minItems && wordsCount >= limits.minWords) {
      description = finalCopy.substring(0, 160) + (finalCopy.length > 160 ? '...' : '')
    }
  } else if (bundle && bundle.week !== week) {
    // Week not found
    return {
      title: 'Week not found',
      robots: { index: false, follow: false }
    }
  }

  const title = `AI Act Updates — ${week} | EU Act Radar`
  const canonical = `/ai-act/updates/week/${week}`
  
  return makeMeta({
    title,
    desc: description,
    canonical
  })
}

export default async function WeekPage({ params }: WeekPageProps) {
  const { week } = await params
  
  // Get pSEO data
  const bundle = await getEARBundle()
  const limits = getPSEOLimits()
  const pseoEnabled = isPSEOEnabled()
  
  // Check if week exists
  if (!bundle || bundle.week !== week) {
    notFound()
  }
  
  const itemsCount = bundle.items.length
  const generatedCopy = copyForWeek(bundle)
  const { text: finalCopy, isThin } = ensureMinWords(generatedCopy, limits.minWords)
  const wordsCount = finalCopy.trim().split(/\s+/).length
  
  const shouldIndex = pseoEnabled && canIndex({
    minItems: limits.minItems,
    minWords: limits.minWords,
    wordsCount,
    itemsCount
  })
  
  // Generate JSON-LD if we pass quality gates
  let jsonLd = null
  if (shouldIndex) {
    const baseUrl = process.env.APP_URL || 'https://wheresmymep.eu'
    const weekDisplay = week.replace('W', 'Week ')
    
    // Breadcrumb JSON-LD
    const breadcrumb = breadcrumbLd([
      { name: 'EU Act Radar', url: `${baseUrl}/ai-act` },
      { name: 'Weekly Updates', url: `${baseUrl}/ai-act/updates` },
      { name: weekDisplay, url: `${baseUrl}/ai-act/updates/week/${week}` }
    ])
    
    // News Article JSON-LD
    const article = newsArticleLd({
      headline: `AI Act Updates — ${weekDisplay}`,
      datePublished: bundle.generatedAt || new Date().toISOString(),
      author: "Where's My MEP?",
      mainEntityOfPage: `${baseUrl}/ai-act/updates/week/${week}`,
      description: finalCopy.substring(0, 160),
      articleSection: 'AI Act Updates'
    })
    
    jsonLd = { breadcrumb, article }
  }
  
  // Get top topics for this week
  const topicCounts = bundle.items.reduce((acc, item) => {
    acc[item.topic] = (acc[item.topic] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topTopics = Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guidance': return 'bg-blue-100 text-blue-800'
      case 'delegated_act': return 'bg-green-100 text-green-800'
      case 'obligation': return 'bg-purple-100 text-purple-800'
      case 'enforcement': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'guidance': return 'Guidance'
      case 'delegated_act': return 'Delegated Act'
      case 'obligation': return 'Obligation'
      case 'enforcement': return 'Enforcement'
      default: return type
    }
  }

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
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.article) }}
          />
        </>
      )}
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <Link href="/ai-act" className="text-purple-600 hover:text-purple-800 flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Act Radar</span>
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
              <Calendar className="h-6 w-6 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                AI Act Updates — {week.replace('W', 'Week ')}
              </h1>
            </div>
            
            <p className="text-lg text-gray-600 mb-4">
              {finalCopy}
            </p>
            
            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>{itemsCount} updates</span>
              <span>{topTopics.length > 0 ? `Top topics: ${topTopics.join(', ')}` : ''}</span>
              {bundle.generatedAt && (
                <span>Updated: {new Date(bundle.generatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          {/* Updates List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>All Updates</span>
              </CardTitle>
              <CardDescription>
                Complete list of AI Act developments for this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bundle.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 flex-1">
                        {item.title}
                      </h3>
                      <Badge className={`ml-2 text-xs ${getTypeColor(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span className="capitalize">{item.topic.replace(/-/g, ' ')}</span>
                    </div>
                    {item.link && item.link !== '#' && (
                      <div className="mt-2">
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:text-purple-800"
                        >
                          View source →
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Related Links */}
          <RelatedLinks 
            context="week" 
            data={{ 
              week,
              topTopics
            }} 
          />
        </main>
      </div>
    </>
  )
}
