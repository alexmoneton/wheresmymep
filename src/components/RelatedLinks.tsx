import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card'

interface RelatedLinksProps {
  context: 'topic' | 'week' | 'mep' | 'country' | 'party'
  data?: {
    topic?: string
    week?: string
    mepId?: string
    mepName?: string
    country?: string
    party?: string
    topMeps?: Array<{ id: string; name: string }>
    recentVotes?: Array<{ id: string; title: string }>
    topTopics?: string[]
  }
}

export function RelatedLinks({ context, data }: RelatedLinksProps) {
  const baseUrl = process.env.APP_URL || 'https://wheresmymep.eu'
  
  const getLinks = () => {
    switch (context) {
      case 'topic':
        return [
          { href: '/ai-act', label: 'EU Act Radar Home', description: 'Overview of all AI Act developments' },
          { href: '/ai-act/pricing', label: 'Get Pro Access', description: 'Unlimited alerts and weekly digests' },
          { href: '/ai-act/what-changed', label: 'Latest Changes', description: 'Most recent AI Act updates' },
          { href: '/leaderboard', label: 'MEP Leaderboard', description: 'Track MEP attendance and voting' }
        ]
      
      case 'week':
        const weekLinks = [
          { href: '/ai-act', label: 'EU Act Radar', description: 'All AI Act developments' },
          { href: '/ai-act/pricing', label: 'Subscribe to Updates', description: 'Get weekly digests delivered' }
        ]
        
        // Add links to top topics of the week
        if (data?.topTopics && data.topTopics.length > 0) {
          data.topTopics.slice(0, 2).forEach(topic => {
            weekLinks.push({
              href: `/ai-act/topics/${topic}`,
              label: `${topic.replace(/-/g, ' ')} Updates`,
              description: `Latest ${topic} developments`
            })
          })
        }
        
        return weekLinks.slice(0, 4)
      
      case 'mep':
        return [
          { href: `/leaderboard`, label: 'MEP Leaderboard', description: 'Compare attendance across all MEPs' },
          { href: `/country/${data?.country?.toLowerCase().replace(/\s+/g, '-')}`, label: `${data?.country} MEPs`, description: `All MEPs from ${data?.country}` },
          { href: `/party/${data?.party?.toLowerCase().replace(/\s+/g, '-')}`, label: `${data?.party} Members`, description: `All ${data?.party} MEPs` },
          { href: '/ai-act', label: 'EU Act Radar', description: 'Track AI Act developments' }
        ]
      
      case 'country':
        const countryLinks = [
          { href: '/leaderboard', label: 'Full Leaderboard', description: 'All MEPs ranked by attendance' },
          { href: '/ai-act', label: 'EU Act Radar', description: 'AI Act compliance tracking' }
        ]
        
        // Add links to top MEPs from this country
        if (data?.topMeps && data.topMeps.length > 0) {
          data.topMeps.slice(0, 3).forEach(mep => {
            countryLinks.push({
              href: `/mep/${mep.id}`,
              label: mep.name,
              description: `${data.country} MEP profile`
            })
          })
        }
        
        return countryLinks.slice(0, 4)
      
      case 'party':
        const partyLinks = [
          { href: '/leaderboard', label: 'Full Leaderboard', description: 'All MEPs ranked by attendance' },
          { href: '/ai-act', label: 'EU Act Radar', description: 'AI Act compliance tracking' }
        ]
        
        // Add links to top MEPs from this party
        if (data?.topMeps && data.topMeps.length > 0) {
          data.topMeps.slice(0, 3).forEach(mep => {
            partyLinks.push({
              href: `/mep/${mep.id}`,
              label: mep.name,
              description: `${data.party} MEP profile`
            })
          })
        }
        
        return partyLinks.slice(0, 4)
      
      default:
        return []
    }
  }

  const links = getLinks()

  if (links.length === 0) {
    return null
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg">Related Pages</CardTitle>
        <CardDescription>
          Explore related content and features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium text-blue-600 hover:text-blue-800">
                {link.label}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


