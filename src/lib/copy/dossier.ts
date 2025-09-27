interface DossierData {
  title: string;
  code?: string;
  summary?: string;
  policyAreas: string[];
  votes?: Array<{ title: string; date: string; result: string; totalFor: number; totalAgainst: number; totalAbstain: number }>;
}

export function dossierCopy({ dossier, votes }: { 
  dossier: DossierData; 
  votes: Array<{ title: string; date: string; result: string; totalFor: number; totalAgainst: number; totalAbstain: number }> 
}): string {
  const { title, code, summary, policyAreas } = dossier;
  
  const codeText = code ? ` (${code})` : '';
  const summaryText = summary ? `${summary} ` : '';
  const policyAreasText = policyAreas.length > 0 
    ? `This dossier covers ${policyAreas.join(', ')}. `
    : '';
  
  const votesText = votes.length > 0 
    ? `The legislative process included ${votes.length} vote${votes.length > 1 ? 's' : ''}: ${votes.slice(0, 3).map(v => `"${v.title}" (${v.result} - ${v.totalFor} for, ${v.totalAgainst} against, ${v.totalAbstain} abstain)`).join(', ')}${votes.length > 3 ? ` and ${votes.length - 3} other votes` : ''}. `
    : '';
  
  return `${title}${codeText} is a key legislative proposal currently under consideration in the European Parliament. ${summaryText}${policyAreasText}

${votesText}This dossier represents an important step in the EU's legislative process, where Members of the European Parliament debate, amend, and vote on proposed legislation that will affect citizens across the European Union. The voting patterns show how different political groups and national delegations align on these critical policy issues.

Understanding the progression of this dossier helps citizens track how their representatives are working on issues that matter to them, and provides insight into the complex decision-making processes that shape European policy.`;
}

export function dossierMetaDescription(dossier: DossierData): string {
  const { title, code, summary, policyAreas } = dossier;
  const shortSummary = summary ? summary.substring(0, 120) + '...' : 'European Parliament legislative proposal';
  const areasText = policyAreas.length > 0 ? ` (${policyAreas.join(', ')})` : '';
  
  return `${title}${code ? ` (${code})` : ''}${areasText} - ${shortSummary}`;
}

export function dossierTitle(dossier: DossierData): string {
  const { title, code } = dossier;
  return `${title}${code ? ` (${code})` : ''} | Where's My MEP?`;
}


