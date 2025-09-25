interface CommitteeData {
  name: string;
  code: string;
  description?: string;
  members?: Array<{ name: string; country: string; party: string; role: string }>;
  recentVotes?: Array<{ title: string; date: string; result: string }>;
}

export function committeeCopy({ committee, members, recentVotes }: { 
  committee: CommitteeData; 
  members: Array<{ name: string; country: string; party: string; role: string }>; 
  recentVotes: Array<{ title: string; date: string; result: string }> 
}): string {
  const { name, code, description } = committee;
  
  const descriptionText = description ? `${description}. ` : '';
  const membersText = members.length > 0 
    ? `The committee has ${members.length} members including ${members.slice(0, 3).map(m => `${m.name} (${m.country}, ${m.party})${m.role !== 'member' ? ` - ${m.role}` : ''}`).join(', ')}${members.length > 3 ? ` and ${members.length - 3} others` : ''}. `
    : '';
  
  const recentVotesText = recentVotes.length > 0 
    ? `Recent committee work includes votes on ${recentVotes.slice(0, 3).map(v => `"${v.title}" (${v.result})`).join(', ')}. `
    : '';
  
  return `The ${name} (${code}) is one of the European Parliament's specialized committees responsible for legislative work in specific policy areas. ${descriptionText}

${membersText}${recentVotesText}This committee plays a crucial role in shaping EU legislation, conducting hearings, and preparing reports on key policy issues. Members work together across political groups to develop positions on proposed legislation before it reaches the full Parliament for final votes.

Committee work is essential for the democratic functioning of the EU, allowing for detailed examination of complex policy proposals and ensuring that diverse perspectives are considered in the legislative process.`;
}

export function committeeMetaDescription(committee: CommitteeData): string {
  const { name, code, description } = committee;
  const shortDesc = description ? description.substring(0, 100) + '...' : 'European Parliament committee';
  
  return `${name} (${code}) - ${shortDesc}. View members, recent votes, and committee work.`;
}

export function committeeTitle(committee: CommitteeData): string {
  const { name, code } = committee;
  return `${name} (${code}) Committee | Where's My MEP?`;
}
