interface MEPData {
  firstName: string;
  lastName: string;
  country: { name: string };
  party?: { name: string; abbreviation?: string };
  committees?: Array<{ name: string; role: string }>;
  recentVotes?: Array<{ title: string; choice: string; date: string }>;
  attendancePct?: number;
  votesCast?: number;
  votesTotal?: number;
}

export function mepCopy({ mep, committees, recentVotes }: { 
  mep: MEPData; 
  committees: Array<{ name: string; role: string }>; 
  recentVotes: Array<{ title: string; choice: string; date: string }> 
}): string {
  const { firstName, lastName, country, party, attendancePct, votesCast, votesTotal } = mep;
  
  const partyText = party ? ` for ${party.name}${party.abbreviation ? ` (${party.abbreviation})` : ''}` : '';
  const roles = committees?.map((c: any) => c.name).join(', ') || 'no recorded committee roles';
  const last = recentVotes?.map((v: any) => v.title).filter(Boolean).slice(0, 3).join('; ');
  
  // Generate unique contextual copy based on specific data
  let contextualCopy = `${firstName} ${lastName} serves as an MEP for ${country.name}${partyText}. This profile consolidates roll-call participation, committee assignments (${roles}), and recent legislative activity.\n\n`;
  
  if (attendancePct !== undefined) {
    contextualCopy += `Their attendance rate of ${attendancePct}% (${votesCast || 0} out of ${votesTotal || 0} votes) `;
  } else {
    contextualCopy += `Their voting record `;
  }
  
  contextualCopy += `shows the split between For/Against/Abstention and instances of non-participation. `;
  
  if (last) {
    contextualCopy += `Recent votes include ${last}. `;
  } else {
    contextualCopy += `Recent legislative activity is ongoing. `;
  }
  
  contextualCopy += `Use the filters to explore votes by topic or dossier and compare patterns across parties and countries. Attendance and participation rates are calculated from official roll-calls and updated on a regular cadence.`;
  
  return contextualCopy;
}

export function mepMetaDescription(mep: MEPData): string {
  const { firstName, lastName, country, party, attendancePct } = mep;
  const partyText = party ? ` (${party.abbreviation || party.name})` : '';
  const attendanceText = attendancePct !== undefined ? ` - ${attendancePct}% attendance` : '';
  
  return `${firstName} ${lastName} - ${country.name} MEP${partyText}${attendanceText}. Track voting record, committee work, and attendance in European Parliament roll-call votes.`;
}

export function mepTitle(mep: MEPData): string {
  const { firstName, lastName, country, party } = mep;
  const partyText = party ? ` (${party.abbreviation || party.name})` : '';
  
  return `${firstName} ${lastName} - ${country.name} MEP${partyText} | Where's My MEP?`;
}
