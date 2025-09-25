interface TopicData {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface Ranking {
  mep: {
    name: string;
    country: string;
    party: string;
  };
  score: number;
  position: number;
}

interface RecentVote {
  title: string;
  date: string;
  result: string;
  totalFor: number;
  totalAgainst: number;
}

export function topicCopy({ topic, rankings, recentVotes }: { 
  topic: TopicData; 
  rankings: Ranking[]; 
  recentVotes: RecentVote[] 
}): string {
  const { name, description } = topic;
  
  // Get top performers
  const topPerformers = rankings.slice(0, 3).map(r => r.mep.name).join(', ');
  const topCountry = rankings[0]?.mep.country || 'various countries';
  const topParty = rankings[0]?.mep.party || 'various parties';
  
  // Get recent activity
  const recentActivity = recentVotes.length > 0 
    ? `Recent votes include ${recentVotes.slice(0, 2).map(v => `"${v.title}"`).join(' and ')}. `
    : 'Recent legislative activity is ongoing. ';
  
  // Generate unique contextual copy based on specific data
  let contextualCopy = `The "${name}" policy area represents a critical domain of European governance, `;
  
  if (description) {
    contextualCopy += `focusing on ${description.toLowerCase()}. `;
  } else {
    contextualCopy += `addressing key challenges and opportunities in European policy. `;
  }
  
  contextualCopy += `This topic page aggregates MEP performance, voting patterns, and legislative activity `;
  contextualCopy += `to provide comprehensive insights into how European Parliament representatives engage with ${name} issues.\n\n`;
  
  contextualCopy += `Top performers in this area include ${topPerformers}, representing ${topCountry} `;
  contextualCopy += `and working across ${topParty}. Their engagement demonstrates the diverse approaches `;
  contextualCopy += `and priorities that shape European policy in this domain.\n\n`;
  
  contextualCopy += `${recentActivity}Understanding these patterns helps identify key stakeholders, `;
  contextualCopy += `policy trends, and the democratic process in action. Use the rankings below to explore `;
  contextualCopy += `individual MEP performance, recent votes, and related legislative activity.`;
  
  return contextualCopy;
}

export function topicMetaDescription(topic: TopicData): string {
  const { name, description } = topic;
  
  return `${name} policy area in the European Parliament. ${description || 'Track MEP performance, voting records, and legislative activity on this important policy topic.'}`;
}

export function topicTitle(topic: TopicData): string {
  return `${topic.name} - Policy Topic | Where's My MEP?`;
}