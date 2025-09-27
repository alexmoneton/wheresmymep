interface VoteData {
  title: string;
  date: string;
  description?: string;
  totalFor: number;
  totalAgainst: number;
  totalAbstain: number;
  totalAbsent: number;
  result: string;
  dossier?: { title: string; code?: string };
  mepVotes?: Array<{ mep: { name: string; country: string; party: string }; choice: string }>;
}

export function voteCopy({ vote, mepVotes }: { 
  vote: VoteData; 
  mepVotes: Array<{ mep: { name: string; country: string; party: string }; choice: string }> 
}): string {
  const { title, date, description, totalFor, totalAgainst, totalAbstain, totalAbsent, result, dossier } = vote;
  
  const dateText = new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const descriptionText = description ? `${description} ` : '';
  const dossierText = dossier ? `This vote was part of the ${dossier.title}${dossier.code ? ` (${dossier.code})` : ''} legislative process. ` : '';
  
  const resultText = result.toLowerCase() === 'adopted' ? 'was adopted' : result.toLowerCase() === 'rejected' ? 'was rejected' : `resulted in ${result}`;
  
  const turnoutText = `The vote ${resultText} with ${totalFor} MEPs voting in favor, ${totalAgainst} against, ${totalAbstain} abstaining, and ${totalAbsent} absent. `;
  
  const mepVotesText = mepVotes.length > 0 
    ? `Notable votes include ${mepVotes.slice(0, 5).map(mv => `${mv.mep.name} (${mv.mep.country}, ${mv.mep.party}) voting ${mv.choice}`).join(', ')}${mepVotes.length > 5 ? ` and ${mepVotes.length - 5} others` : ''}. `
    : '';
  
  return `On ${dateText}, the European Parliament voted on "${title}". ${descriptionText}${dossierText}

${turnoutText}${mepVotesText}This roll-call vote provides transparency into how individual Members of the European Parliament positioned themselves on this important policy issue, allowing citizens to see how their representatives voted and understand the political dynamics at play.

Roll-call votes are a crucial tool for democratic accountability, ensuring that MEPs' positions on key issues are publicly recorded and accessible to voters, journalists, and researchers tracking parliamentary behavior.`;
}

export function voteMetaDescription(vote: VoteData): string {
  const { title, date, totalFor, totalAgainst, result } = vote;
  const dateText = new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  return `${title} - ${dateText} vote (${result}: ${totalFor} for, ${totalAgainst} against). European Parliament roll-call vote results.`;
}

export function voteTitle(vote: VoteData): string {
  const { title, date } = vote;
  const dateText = new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  return `${title} - ${dateText} | Where's My MEP?`;
}


