import { EARChange, EARBundle, MEPStats } from './pseo'

// Copy generation for EU Act Radar topics
export function copyForTopic(topic: string, items: EARChange[]): string {
  const topicName = topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  // Group items by type
  const byType = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = []
    acc[item.type].push(item)
    return acc
  }, {} as Record<string, EARChange[]>)

  const typeNames = {
    'guidance': 'guidance documents',
    'delegated_act': 'delegated acts',
    'obligation': 'obligations',
    'enforcement': 'enforcement actions',
    'consultation': 'public consultations'
  }

  let copy = `Stay updated on the latest ${topicName} developments in the EU AI Act. `
  
  // Build paragraphs for each type
  const paragraphs: string[] = []
  
  Object.entries(byType).forEach(([type, typeItems]) => {
    const typeName = typeNames[type as keyof typeof typeNames] || type
    const count = typeItems.length
    
    if (count === 1) {
      paragraphs.push(`Recent ${typeName} include: ${typeItems[0].title} (${typeItems[0].date}).`)
    } else if (count <= 3) {
      const titles = typeItems.map(item => `${item.title} (${item.date})`).join(', ')
      paragraphs.push(`Recent ${typeName} include: ${titles}.`)
    } else {
      const firstTwo = typeItems.slice(0, 2).map(item => `${item.title} (${item.date})`).join(', ')
      paragraphs.push(`Recent ${typeName} include: ${firstTwo}, and ${count - 2} more updates.`)
    }
  })

  copy += paragraphs.join(' ')
  
  // Add context and CTA
  copy += ` These updates are crucial for organizations navigating AI Act compliance requirements. `
  copy += `Subscribe to our weekly digest to never miss important ${topicName} developments.`
  
  return copy
}

// Copy generation for MEP profiles
export function copyForMEP(mepRecord: { name: string; attendance?: number; country?: string; party?: string; votesCast?: number; totalVotes?: number }): string {
  const { name, attendance, country, party, votesCast, totalVotes } = mepRecord
  
  let copy = `${name} is a Member of the European Parliament representing ${country || 'their constituency'}. `
  
  if (attendance !== undefined) {
    copy += `Their attendance rate in roll-call votes over the last 180 days is ${attendance.toFixed(1)}%. `
  }
  
  if (votesCast !== undefined && totalVotes !== undefined) {
    copy += `They have participated in ${votesCast} out of ${totalVotes} recent roll-call votes. `
  }
  
  if (party) {
    copy += `As a member of ${party}, they contribute to shaping European legislation. `
  }
  
  copy += `Track their voting record and set up alerts to stay informed about their participation in key votes. `
  copy += `Download their attendance data or explore the full MEP leaderboard for comparative analysis.`
  
  return copy
}

// Copy generation for weekly bundles
export function copyForWeek(bundle: EARBundle): string {
  const { week, items } = bundle
  const weekDisplay = week.replace('W', 'Week ')
  
  let copy = `The week of ${weekDisplay} brought significant developments in EU AI Act implementation. `
  
  // Group by type for summary
  const byType = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const typeSummary = Object.entries(byType)
    .map(([type, count]) => `${count} ${type.replace('_', ' ')}`)
    .join(', ')
  
  copy += `This week's updates included ${typeSummary}. `
  
  // Highlight top topics
  const topicCounts = items.reduce((acc, item) => {
    acc[item.topic] = (acc[item.topic] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topTopics = Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic.replace(/-/g, ' '))
  
  if (topTopics.length > 0) {
    copy += `Key focus areas this week were ${topTopics.join(', ')}. `
  }
  
  // Add specific highlights
  const recentItems = items.slice(0, 3)
  if (recentItems.length > 0) {
    copy += `Notable updates include: ${recentItems.map(item => item.title).join(', ')}. `
  }
  
  copy += `Stay ahead of AI Act compliance with our weekly digest and topic-specific alerts.`
  
  return copy
}

// Helper to ensure minimum word count
export function ensureMinWords(text: string, minWords: number = 160): { text: string; isThin: boolean } {
  const currentWords = text.trim().split(/\s+/).length
  
  if (currentWords >= minWords) {
    return { text, isThin: false }
  }
  
  // Add generic content to reach minimum
  const additionalContent = ` This information is regularly updated to provide the most current insights into EU AI Act developments. For comprehensive coverage and real-time alerts, consider subscribing to our professional monitoring services.`
  
  return {
    text: text + additionalContent,
    isThin: true
  }
}

// Topic display names
export const TOPIC_DISPLAY_NAMES: Record<string, string> = {
  'logging': 'Logging and Record-Keeping',
  'dataset-governance': 'Dataset Governance',
  'post-market-monitoring': 'Post-Market Monitoring',
  'transparency': 'Transparency Requirements',
  'risk-management': 'Risk Management',
  'enforcement': 'Enforcement Actions',
  'consultation': 'Public Consultations',
  'guidance': 'Guidance Documents',
  'delegated-acts': 'Delegated Acts',
  'obligations': 'Provider Obligations'
}

export function getTopicDisplayName(topic: string): string {
  return TOPIC_DISPLAY_NAMES[topic] || topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
