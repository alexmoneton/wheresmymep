import { listMEPs, type EnrichedMEP } from '@/lib/data';

export type LeaderboardRow = {
  id: string;
  name: string;
  country: string;
  countryCode?: string;
  party?: string;
  attendancePct: number;
  votesCast?: number;
  totalVotes?: number;
};

export interface LeaderboardParams {
  page?: number;
  pageSize?: number;
  q?: string;
  sortBy?: 'attendance' | 'party' | 'country' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface LeaderboardResult {
  rows: LeaderboardRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Country code mapping (simplified - you might want to expand this)
const COUNTRY_CODES: Record<string, string> = {
  'Austria': 'AT',
  'Belgium': 'BE',
  'Bulgaria': 'BG',
  'Croatia': 'HR',
  'Cyprus': 'CY',
  'Czech Republic': 'CZ',
  'Denmark': 'DK',
  'Estonia': 'EE',
  'Finland': 'FI',
  'France': 'FR',
  'Germany': 'DE',
  'Greece': 'GR',
  'Hungary': 'HU',
  'Ireland': 'IE',
  'Italy': 'IT',
  'Latvia': 'LV',
  'Lithuania': 'LT',
  'Luxembourg': 'LU',
  'Malta': 'MT',
  'Netherlands': 'NL',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Romania': 'RO',
  'Slovakia': 'SK',
  'Slovenia': 'SI',
  'Spain': 'ES',
  'Sweden': 'SE',
};

function getCountryCode(country: string): string | undefined {
  return COUNTRY_CODES[country];
}

function normalizeMEP(mep: EnrichedMEP): LeaderboardRow {
  return {
    id: mep.mep_id || '',
    name: mep.name,
    country: mep.country,
    countryCode: getCountryCode(mep.country),
    party: mep.party,
    attendancePct: mep.attendance_pct || 0,
    votesCast: mep.votes_cast,
    totalVotes: mep.votes_total_period,
  };
}

export async function fetchLeaderboard(params: LeaderboardParams = {}): Promise<LeaderboardResult> {
  const { page = 1, pageSize = 50, q = '', sortBy = 'attendance', sortOrder = 'desc' } = params;
  
  try {
    // Get all MEPs from the data source
    const allMEPs = listMEPs();
    
    // Filter MEPs with valid data (same logic as homepage)
    let filteredMEPs = allMEPs.filter(mep => {
      // Must have an ID and attendance data
      if (!mep.mep_id || (mep.votes_total_period || 0) === 0) {
        return false;
      }
      
      // Exclude MEPs on sick leave
      if (mep.sick_leave) {
        return false;
      }
      
      return true;
    });
    
    // Apply search filter if provided
    if (q.trim()) {
      const searchTerm = q.toLowerCase().trim();
      filteredMEPs = filteredMEPs.filter(mep => 
        mep.name.toLowerCase().includes(searchTerm) ||
        mep.country.toLowerCase().includes(searchTerm) ||
        (mep.party && mep.party.toLowerCase().includes(searchTerm))
      );
    }
    
    // Sort based on sortBy parameter
    filteredMEPs.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'attendance':
          comparison = (a.attendance_pct || 0) - (b.attendance_pct || 0);
          break;
        case 'party':
          comparison = (a.party || '').localeCompare(b.party || '');
          break;
        case 'country':
          comparison = a.country.localeCompare(b.country);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          comparison = (a.attendance_pct || 0) - (b.attendance_pct || 0);
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    // Calculate pagination
    const total = filteredMEPs.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // Get the page slice
    const pageMEPs = filteredMEPs.slice(startIndex, endIndex);
    
    // Normalize the data
    const rows = pageMEPs.map(normalizeMEP);
    
    return {
      rows,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    
    // Return empty result on error
    return {
      rows: [],
      total: 0,
      page: 1,
      pageSize: 50,
      totalPages: 0,
    };
  }
}
