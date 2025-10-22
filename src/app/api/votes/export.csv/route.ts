import { NextRequest, NextResponse } from 'next/server';
import { loadData, getNotableVotes, getVote } from '@/lib/data';

interface VoteSearchParams {
  q?: string;
  dossier_id?: string;
  date_from?: string;
  date_to?: string;
  group?: string;
  country?: string;
  party?: string;
  mep_id?: string;
  outcome?: string;
}

interface VoteResult {
  vote_id: string;
  dossier_id: string;
  dossier_title: string;
  date: string;
  mep_id: string;
  mep_name: string;
  group: string;
  country: string;
  party: string;
  outcome: string;
  majority_outcome: string;
  ep_source_url: string;
  leadership_role: boolean;
  role_note?: string;
}

// Helper functions
function getCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    'Germany': 'DE', 'France': 'FR', 'Italy': 'IT', 'Spain': 'ES', 'Poland': 'PL',
    'Romania': 'RO', 'Netherlands': 'NL', 'Belgium': 'BE', 'Greece': 'GR',
    'Czech Republic': 'CZ', 'Sweden': 'SE', 'Portugal': 'PT', 'Hungary': 'HU',
    'Austria': 'AT', 'Bulgaria': 'BG', 'Denmark': 'DK', 'Finland': 'FI',
    'Slovakia': 'SK', 'Ireland': 'IE', 'Croatia': 'HR', 'Lithuania': 'LT',
    'Slovenia': 'SI', 'Latvia': 'LV', 'Estonia': 'EE', 'Cyprus': 'CY',
    'Luxembourg': 'LU', 'Malta': 'MT'
  };
  return countryMap[country] || country;
}

function getGroupAbbreviation(party: string): string {
  if (!party) return '';
  
  if (party.includes('European People\'s Party') || party.includes('EPP')) return 'EPP';
  if (party.includes('Progressive Alliance of Socialists') || party.includes('S&D')) return 'S&D';
  if (party.includes('Renew Europe') || party.includes('RE')) return 'RE';
  if (party.includes('Greens/European Free Alliance') || party.includes('Greens/EFA')) return 'Greens/EFA';
  if (party.includes('European Conservatives and Reformists') || party.includes('ECR')) return 'ECR';
  if (party.includes('Identity and Democracy') || party.includes('ID')) return 'ID';
  if (party.includes('The Left') || party.includes('GUE/NGL')) return 'Left';
  if (party.includes('Patriots for Europe') || party.includes('PfE')) return 'Patriots';
  if (party.includes('Europe of Sovereign Nations') || party.includes('ESN')) return 'ESN';
  if (party.includes('Non-attached') || party.includes('NI')) return 'NI';
  
  return party;
}

function getLeadershipRole(name: string): { leadership_role: boolean; role_note?: string } {
  const vicePresidents = [
    'Sabine Verheyen', 'Ewa Kopacz', 'Esteban González Pons', 'Katarina Barley',
    'Pina Picierno', 'Victor Negrescu', 'Martin Hojsík', 'Christel Schaldemose',
    'Javi López Fernández', 'Sophie Wilmès', 'Nicolae Ştefănuţă', 'Roberts Zīle',
    'Antonella Sberna', 'Younous Omarjee'
  ];
  
  if (vicePresidents.includes(name)) {
    return { leadership_role: true, role_note: 'Vice-President' };
  }
  
  return { leadership_role: false };
}

export async function GET(request: NextRequest) {
  try {
    // Load data with special roles applied
    loadData();
    
    const { searchParams } = new URL(request.url);
    const params: VoteSearchParams = {
      q: searchParams.get('q') || undefined,
      dossier_id: searchParams.get('dossier_id') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      group: searchParams.get('group') || undefined,
      country: searchParams.get('country') || undefined,
      party: searchParams.get('party') || undefined,
      mep_id: searchParams.get('mep_id') || undefined,
      outcome: searchParams.get('outcome') || undefined
    };

    // Get all MEPs and their notable votes
    const meps = JSON.parse(require('fs').readFileSync(require('path').join(process.cwd(), 'public/data/meps.json'), 'utf8'));
    
    const allVoteResults: VoteResult[] = [];
    
    // Process each MEP
    for (const mep of meps) {
      // Apply MEP filters first
      if (params.mep_id && mep.mep_id !== params.mep_id) continue;
      if (params.country && getCountryCode(mep.country) !== params.country) continue;
      if (params.group && getGroupAbbreviation(mep.party) !== params.group) continue;
      if (params.party && mep.national_party !== params.party) continue;
      
      // Get notable votes for this MEP
      const notableVotes = getNotableVotes(mep.mep_id);
      
      for (const notableVote of notableVotes) {
        // Get the full vote details
        const vote = getVote(notableVote.vote_id);
        if (!vote) continue;
        
        // Apply vote filters
        if (params.q && !vote.title.toLowerCase().includes(params.q.toLowerCase())) continue;
        if (params.dossier_id && vote.vote_id !== params.dossier_id) continue;
        if (params.outcome && notableVote.vote_position !== params.outcome) continue;
        
        // Apply date filters
        if (params.date_from) {
          const voteDate = new Date(vote.vote_date);
          const fromDate = new Date(params.date_from);
          if (voteDate < fromDate) continue;
        }
        if (params.date_to) {
          const voteDate = new Date(vote.vote_date);
          const toDate = new Date(params.date_to);
          if (voteDate > toDate) continue;
        }
        
        // Get leadership role info
        const leadership = getLeadershipRole(mep.name);
        
        // Determine majority outcome
        const totalFor = vote.total_for || 0;
        const totalAgainst = vote.total_against || 0;
        
        let majorityOutcome = 'tie';
        if (totalFor > totalAgainst) {
          majorityOutcome = 'for';
        } else if (totalAgainst > totalFor) {
          majorityOutcome = 'against';
        }
        
        const voteResult: VoteResult = {
          vote_id: vote.vote_id,
          dossier_id: vote.vote_id,
          dossier_title: vote.title,
          date: vote.vote_date.split(' ')[0],
          mep_id: mep.mep_id,
          mep_name: mep.name,
          group: getGroupAbbreviation(mep.party),
          country: getCountryCode(mep.country),
          party: mep.national_party || '',
          outcome: notableVote.vote_position,
          majority_outcome: majorityOutcome,
          ep_source_url: vote.source_url,
          leadership_role: leadership.leadership_role,
          role_note: leadership.role_note
        };
        
        allVoteResults.push(voteResult);
      }
    }
    
    // Check row cap
    if (allVoteResults.length > 100000) {
      return NextResponse.json(
        { error: 'Export too large. Please apply more filters to reduce the number of results.' },
        { status: 400 }
      );
    }
    
    // Create CSV content
    const headers = [
      'Date', 'Dossier Title', 'MEP', 'Group', 'Country', 'Party', 
      'Outcome', 'Majority', 'Source'
    ];
    
    const csvRows = allVoteResults.map(vote => [
      vote.date,
      `"${vote.dossier_title.replace(/"/g, '""')}"`,
      `"${vote.mep_name.replace(/"/g, '""')}"`,
      vote.group,
      vote.country,
      `"${vote.party.replace(/"/g, '""')}"`,
      vote.outcome,
      vote.majority_outcome,
      vote.ep_source_url
    ]);
    
    const csvContent = [headers, ...csvRows]
      .map(row => row.join(','))
      .join('\n');
    
    // Set headers for file download
    const response = new NextResponse(csvContent);
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set('Content-Disposition', 'attachment; filename="votes-export.csv"');
    response.headers.set('X-Export-Filters', JSON.stringify(params));
    
    return response;
    
  } catch (error) {
    console.error('Error in /api/votes/export.csv:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}