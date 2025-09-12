import fs from 'fs';
import path from 'path';

// Type definitions
export type MEPIdentity = {
  mep_id: string;
  name: string;
  country: string;
  party: string;           // EU political group
  national_party: string;
  profile_url?: string;
  photo_url?: string;
};

export type MEPAttendance = {
  mep_id: string;
  votes_total_period: number;
  votes_cast: number;
  attendance_pct: number;  // 0..100
  partial_term?: boolean;
};

export type VoteCatalog = {
  vote_id: string;
  vote_date: string;       // YYYY-MM-DD
  title: string;
  result?: string;         // adopted/rejected/unknown
  olp_stage?: string;
  total_for?: number;
  total_against?: number;
  total_abstain?: number;
  source_url: string;
};

export type NotableVote = VoteCatalog & {
  mep_id: string;
  vote_position: 'For' | 'Against' | 'Abstain' | 'Not voting';
};

export type EnrichedMEP = MEPIdentity & Partial<MEPAttendance> & {
  special_role?: string; // e.g., "President", "Vice-President", etc.
  sick_leave?: boolean; // MEP is on sick leave
};

// Global data storage
let mepsEnriched: EnrichedMEP[] = [];
let notableByMep: Record<string, NotableVote[]> = {};
let votesCatalog: VoteCatalog[] = [];
let votesCatalogMap: Record<string, VoteCatalog> = {};

// Function to identify special roles and status
function getSpecialRole(mep: MEPIdentity): string | undefined {
  // President of the European Parliament
  if (mep.name === 'Roberta Metsola') {
    return 'President';
  }
  
  // Add other special roles as needed
  // Vice-Presidents, Committee Chairs, etc.
  
  return undefined;
}

// Function to identify MEPs on sick leave
function isOnSickLeave(mep: MEPIdentity): boolean {
  // Anja Hazekamp is on sick leave due to breast cancer
  if (mep.name === 'Anja Hazekamp') {
    return true;
  }
  
  // Add other MEPs on sick leave as needed
  
  return false;
}

// Load JSON data from public directory
function loadJSON<T>(filePath: string): T {
  try {
    const jsonContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error(`Error loading JSON file ${filePath}:`, error);
    return {} as T;
  }
}

// Load and merge all data
export function loadData(): void {
  console.log('🔄 Loading MEP data from JSON files...');
  
  const publicDataDir = path.join(process.cwd(), 'public', 'data');
  
  // Load enriched MEPs data
  mepsEnriched = loadJSON<EnrichedMEP[]>(path.join(publicDataDir, 'meps.json'));
  console.log(`📊 Loaded ${mepsEnriched.length} enriched MEPs`);
  
  // Add special roles and sick leave status to MEPs
  mepsEnriched = mepsEnriched.map(mep => ({
    ...mep,
    special_role: getSpecialRole(mep),
    sick_leave: isOnSickLeave(mep)
  }));
  
  // Load votes catalog
  votesCatalog = loadJSON<VoteCatalog[]>(path.join(publicDataDir, 'votes.json'));
  console.log(`📊 Loaded ${votesCatalog.length} votes from catalog`);
  
  // Create votes lookup map
  votesCatalogMap = Object.fromEntries(
    votesCatalog.map(vote => [vote.vote_id, vote])
  );
  
  // Load notable votes grouped by MEP
  notableByMep = loadJSON<Record<string, NotableVote[]>>(path.join(publicDataDir, 'notable-votes.json'));
  console.log(`📊 Loaded notable votes for ${Object.keys(notableByMep).length} MEPs`);
  
  // Load metadata
  const metadata = loadJSON<{ generated_at?: string }>(path.join(publicDataDir, 'metadata.json'));
  
  // Validation and logging
  console.log('\n📈 DATA VALIDATION SUMMARY:');
  console.log(`- MEPs loaded: ${mepsEnriched.length}`);
  console.log(`- Votes catalog: ${votesCatalog.length}`);
  console.log(`- Notable vote records: ${Object.values(notableByMep).flat().length}`);
  console.log(`- Distinct MEP IDs: ${new Set(mepsEnriched.map(m => m.mep_id)).size}`);
  
  const withAttendance = mepsEnriched.filter(m => (m.votes_total_period || 0) > 0).length;
  console.log(`- MEPs with attendance data: ${withAttendance} (${(withAttendance/mepsEnriched.length*100).toFixed(1)}%)`);
  
  const missingProfile = mepsEnriched.filter(m => !m.profile_url).length;
  const missingPhoto = mepsEnriched.filter(m => !m.photo_url).length;
  console.log(`- MEPs missing profile_url: ${missingProfile}`);
  console.log(`- MEPs missing photo_url: ${missingPhoto}`);
  
  if (metadata.generated_at) {
    console.log(`- Data generated: ${metadata.generated_at}`);
  }
  
  // Spot check examples
  console.log('\n🔍 SPOT CHECK EXAMPLES:');
  mepsEnriched.slice(0, 3).forEach((mep, i) => {
    console.log(`${i + 1}. ${mep.name} (${mep.country}) - ${mep.attendance_pct}% attendance`);
  });
  
  console.log('✅ Data loading complete!\n');
}

// Query helper functions
export function listMEPs(): EnrichedMEP[] {
  return mepsEnriched;
}

export function getMEP(id: string): EnrichedMEP | null {
  return mepsEnriched.find(mep => mep.mep_id === id) || null;
}

export function getMEPByName(name: string): EnrichedMEP | null {
  return mepsEnriched.find(mep => mep.name.toLowerCase() === name.toLowerCase()) || null;
}

export function getNotableVotes(id: string): NotableVote[] {
  return notableByMep[id] || [];
}

export function getVote(voteId: string): VoteCatalog | null {
  return votesCatalogMap[voteId] || null;
}

export function getLeaderboardTop(n: number = 25): EnrichedMEP[] {
  return mepsEnriched
    .filter(mep => mep.mep_id && (mep.votes_total_period || 0) > 0)
    .sort((a, b) => (b.attendance_pct || 0) - (a.attendance_pct || 0))
    .slice(0, n);
}

export function getLeaderboardBottom(n: number = 25): EnrichedMEP[] {
  return mepsEnriched
    .filter(mep => {
      // Exclude MEPs with special roles (like President) from bottom leaderboard
      if (mep.special_role) return false;
      
      // Exclude MEPs on sick leave (like Anja Hazekamp)
      if (mep.sick_leave) return false;
      
      // Exclude MEPs without IDs (new/replacement MEPs like Jaroslav Knot)
      if (!mep.mep_id) return false;
      
      // Exclude MEPs with partial terms (they haven't had a fair chance to vote)
      if (mep.partial_term) return false;
      
      // Only include MEPs who have had a reasonable chance to vote
      // Exclude MEPs with very few total votes (likely new/replacement MEPs)
      return (mep.votes_total_period || 0) > 100;
    })
    .sort((a, b) => (a.attendance_pct || 0) - (b.attendance_pct || 0))
    .slice(0, n);
}

export function getMEPsWithLimitedTerms(): EnrichedMEP[] {
  return mepsEnriched
    .filter(mep => {
      // Include MEPs without IDs (new/replacement MEPs) or with partial terms or very few votes
      return !mep.mep_id || mep.partial_term || ((mep.votes_total_period || 0) <= 100);
    })
    .sort((a, b) => (a.votes_total_period || 0) - (b.votes_total_period || 0));
}

export function searchMEPs(query: string, group?: string, country?: string): EnrichedMEP[] {
  let results = mepsEnriched;
  
  if (query) {
    const searchTerm = query.toLowerCase();
    results = results.filter(mep => 
      mep.name.toLowerCase().includes(searchTerm) ||
      mep.country.toLowerCase().includes(searchTerm)
    );
  }
  
  if (group) {
    results = results.filter(mep => 
      mep.party.toLowerCase().includes(group.toLowerCase())
    );
  }
  
  if (country) {
    results = results.filter(mep => 
      mep.country.toLowerCase().includes(country.toLowerCase())
    );
  }
  
  return results;
}

// Initialize data on module load
if (typeof window === 'undefined') {
  loadData();
}
