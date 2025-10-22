import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
  page?: number;
  page_size?: number;
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

interface VoteSearchResponse {
  items: VoteResult[];
  page: number;
  page_size: number;
  total: number;
  export_url: string;
  too_large?: boolean;
}

// Load data from JSON files
function loadVotesData() {
  const publicDataDir = path.join(process.cwd(), 'public', 'data');
  
  const votes = JSON.parse(fs.readFileSync(path.join(publicDataDir, 'votes.json'), 'utf-8'));
  const meps = JSON.parse(fs.readFileSync(path.join(publicDataDir, 'meps.json'), 'utf-8'));
  const notableVotes = JSON.parse(fs.readFileSync(path.join(publicDataDir, 'notable-votes.json'), 'utf-8'));
  
  return { votes, meps, notableVotes };
}

// Check if MEP has leadership role
function getLeadershipRole(mepName: string): { leadership_role: boolean; role_note?: string } {
  const vicePresidents = [
    'Sabine Verheyen',
    'Ewa Kopacz', 
    'Esteban González Pons',
    'Katarina Barley',
    'Pina Picierno',
    'Victor Negrescu',
    'Martin Hojsík',
    'Christel Schaldemose',
    'Javi López Fernández',
    'Sophie Wilmès',
    'Nicolae Ştefănuţă',
    'Roberts Zīle',
    'Antonella Sberna',
    'Younous Omarjee'
  ];
  
  if (vicePresidents.includes(mepName)) {
    return {
      leadership_role: true,
      role_note: 'Vice-President (doesn\'t usually vote when chairing)'
    };
  }
  
  return { leadership_role: false };
}

// Map party groups to abbreviations
function getGroupAbbreviation(party: string): string {
  const groupMap: Record<string, string> = {
    'European People\'s Party (EPP)': 'EPP',
    'Progressive Alliance of Socialists and Democrats (S&D)': 'S&D',
    'Renew Europe (RE)': 'RE',
    'Greens/European Free Alliance (Greens/EFA)': 'Greens/EFA',
    'European Conservatives and Reformists (ECR)': 'ECR',
    'Identity and Democracy (ID)': 'ID',
    'The Left in the European Parliament (GUE/NGL)': 'Left',
    'The Patriots for Europe (PfE)': 'Patriots',
    'Europe of Sovereign Nations (ESN)': 'ESN',
    'Non-attached (NI)': 'NI'
  };
  
  return groupMap[party] || party;
}

// Map country names to ISO codes
function getCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    'Germany': 'DE',
    'France': 'FR',
    'Italy': 'IT',
    'Spain': 'ES',
    'Poland': 'PL',
    'Romania': 'RO',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Greece': 'GR',
    'Czech Republic': 'CZ',
    'Sweden': 'SE',
    'Portugal': 'PT',
    'Hungary': 'HU',
    'Austria': 'AT',
    'Bulgaria': 'BG',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Slovakia': 'SK',
    'Ireland': 'IE',
    'Croatia': 'HR',
    'Lithuania': 'LT',
    'Slovenia': 'SI',
    'Latvia': 'LV',
    'Estonia': 'EE',
    'Cyprus': 'CY',
    'Luxembourg': 'LU',
    'Malta': 'MT'
  };
  
  return countryMap[country] || country;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const params: VoteSearchParams = {
      q: searchParams.get('q') || undefined,
      dossier_id: searchParams.get('dossier_id') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      group: searchParams.get('group') || undefined,
      country: searchParams.get('country') || undefined,
      party: searchParams.get('party') || undefined,
      mep_id: searchParams.get('mep_id') || undefined,
      outcome: searchParams.get('outcome') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      page_size: Math.min(parseInt(searchParams.get('page_size') || '50'), 200)
    };

    // Load data
    const { votes, meps, notableVotes } = loadVotesData();
    
    // Create MEP lookup
    const mepLookup = new Map();
    meps.forEach((mep: any) => {
      mepLookup.set(mep.mep_id, mep);
    });
    
    // Create vote results by combining votes with notable votes
    const allVoteResults: VoteResult[] = [];
    
    // Process each vote
    votes.forEach((vote: any) => {
      const voteDate = new Date(vote.vote_date);
      
      // Apply date filters
      if (params.date_from) {
        const fromDate = new Date(params.date_from);
        if (voteDate < fromDate) return;
      }
      if (params.date_to) {
        const toDate = new Date(params.date_to);
        if (voteDate > toDate) return;
      }
      
      // Apply keyword filter
      if (params.q && !vote.title.toLowerCase().includes(params.q.toLowerCase())) {
        return;
      }
      
      // Apply dossier filter
      if (params.dossier_id && vote.vote_id !== params.dossier_id) {
        return;
      }
      
      // Get all MEPs who voted on this vote by checking notable votes
      // notableVotes is organized by MEP ID, so we need to check each MEP
      Object.keys(notableVotes).forEach(mepId => {
        const mepVotes = notableVotes[mepId];
        const voteRecord = mepVotes.find((v: any) => v.vote_id === vote.vote_id);
        
        if (!voteRecord) return;
        
        const mep = mepLookup.get(mepId);
        if (!mep) return;
        
        // Apply MEP filters
        if (params.mep_id && mep.mep_id !== params.mep_id) return;
        if (params.country && getCountryCode(mep.country) !== params.country) return;
        if (params.group && getGroupAbbreviation(mep.party) !== params.group) return;
        if (params.party && mep.national_party !== params.party) return;
        if (params.outcome && voteRecord.vote_position !== params.outcome) return;
        
        // Get leadership role info
        const leadership = getLeadershipRole(mep.name);
        
        // Determine majority outcome
        const totalFor = vote.total_for || 0;
        const totalAgainst = vote.total_against || 0;
        const totalAbstain = vote.total_abstain || 0;
        
        let majorityOutcome = 'tie';
        if (totalFor > totalAgainst) {
          majorityOutcome = 'for';
        } else if (totalAgainst > totalFor) {
          majorityOutcome = 'against';
        }
        
        const voteResult: VoteResult = {
          vote_id: vote.vote_id,
          dossier_id: vote.vote_id, // Using vote_id as dossier_id for now
          dossier_title: vote.title,
          date: vote.vote_date.split(' ')[0], // Extract date part
          mep_id: mep.mep_id,
          mep_name: mep.name,
          group: getGroupAbbreviation(mep.party),
          country: getCountryCode(mep.country),
          party: mep.national_party || '',
          outcome: voteRecord.vote_position,
          majority_outcome: majorityOutcome,
          ep_source_url: vote.source_url,
          leadership_role: leadership.leadership_role,
          role_note: leadership.role_note
        };
        
        allVoteResults.push(voteResult);
      });
    });
    
    // Check if too large
    const tooLarge = allVoteResults.length > 50000;
    
    // Apply pagination
    const startIndex = (params.page - 1) * params.page_size;
    const endIndex = startIndex + params.page_size;
    const paginatedResults = allVoteResults.slice(startIndex, endIndex);
    
    // Create export URL
    const exportParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && key !== 'page' && key !== 'page_size') {
        exportParams.set(key, value.toString());
      }
    });
    const exportUrl = `/api/votes/export.csv?${exportParams.toString()}`;
    
    const response: VoteSearchResponse = {
      items: paginatedResults,
      page: params.page,
      page_size: params.page_size,
      total: allVoteResults.length,
      export_url: exportUrl,
      too_large: tooLarge
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in vote search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
