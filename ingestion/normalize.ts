import { z } from 'zod';

// Validation schemas
export const MEPIdentitySchema = z.object({
  mep_id: z.string(),
  name: z.string(),
  country: z.string(),
  party: z.string(),
  national_party: z.string(),
  profile_url: z.string().optional(),
  photo_url: z.string().optional(),
});

export const MEPAttendanceSchema = z.object({
  mep_id: z.string(),
  votes_total_period: z.number(),
  votes_cast: z.number(),
  attendance_pct: z.number().min(0).max(100),
  partial_term: z.boolean().optional(),
});

export const VoteCatalogSchema = z.object({
  vote_id: z.string(),
  vote_date: z.string(),
  title: z.string(),
  result: z.string().optional(),
  olp_stage: z.string().optional(),
  total_for: z.number().optional(),
  total_against: z.number().optional(),
  total_abstain: z.number().optional(),
  source_url: z.string(),
});

export const NotableVoteSchema = VoteCatalogSchema.extend({
  mep_id: z.string(),
  vote_position: z.enum(['For', 'Against', 'Abstain', 'Not voting']),
});

// Type definitions
export type MEPIdentity = z.infer<typeof MEPIdentitySchema>;
export type MEPAttendance = z.infer<typeof MEPAttendanceSchema>;
export type VoteCatalog = z.infer<typeof VoteCatalogSchema>;
export type NotableVote = z.infer<typeof NotableVoteSchema>;

// Normalization helpers
export function normalizeCountryName(country: string): string {
  const countryMap: Record<string, string> = {
    'Czech Republic': 'Czechia',
    'United Kingdom': 'UK',
    'United States': 'USA',
  };
  return countryMap[country] || country;
}

export function normalizePartyName(party: string): string {
  const partyMap: Record<string, string> = {
    'European People\'s Party (Christian Democrats)': 'EPP',
    'Progressive Alliance of Socialists and Democrats': 'S&D',
    'Renew Europe': 'RE',
    'European Conservatives and Reformists': 'ECR',
    'Identity and Democracy': 'ID',
    'The Left': 'GUE/NGL',
    'Greens/European Free Alliance': 'Greens/EFA',
    'Non-attached Members': 'NI',
  };
  return partyMap[party] || party;
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function normalizeMEPName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1] };
  }
  // For names with more than 2 parts, assume first part is first name, rest is last name
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  };
}

export function extractPolicyAreas(title: string, description?: string): string[] {
  const text = `${title} ${description || ''}`.toLowerCase();
  const policyAreas: string[] = [];
  
  const areaMap: Record<string, string> = {
    'climate': 'Climate & Environment',
    'environment': 'Climate & Environment',
    'green': 'Climate & Environment',
    'emission': 'Climate & Environment',
    'energy': 'Energy',
    'renewable': 'Energy',
    'nuclear': 'Energy',
    'migration': 'Migration & Asylum',
    'asylum': 'Migration & Asylum',
    'refugee': 'Migration & Asylum',
    'border': 'Migration & Asylum',
    'digital': 'Digital & Technology',
    'ai': 'Digital & Technology',
    'artificial intelligence': 'Digital & Technology',
    'data': 'Digital & Technology',
    'privacy': 'Digital & Technology',
    'trade': 'Trade & Economy',
    'economy': 'Trade & Economy',
    'budget': 'Trade & Economy',
    'fiscal': 'Trade & Economy',
    'agriculture': 'Agriculture',
    'farming': 'Agriculture',
    'food': 'Agriculture',
    'health': 'Health',
    'medical': 'Health',
    'pharmaceutical': 'Health',
    'education': 'Education & Culture',
    'culture': 'Education & Culture',
    'research': 'Education & Culture',
    'transport': 'Transport',
    'infrastructure': 'Transport',
    'defense': 'Defense & Security',
    'security': 'Defense & Security',
    'foreign': 'Foreign Affairs',
    'international': 'Foreign Affairs',
    'human rights': 'Human Rights',
    'democracy': 'Democracy & Rule of Law',
    'rule of law': 'Democracy & Rule of Law',
    'justice': 'Justice & Home Affairs',
    'home affairs': 'Justice & Home Affairs',
  };
  
  for (const [keyword, area] of Object.entries(areaMap)) {
    if (text.includes(keyword) && !policyAreas.includes(area)) {
      policyAreas.push(area);
    }
  }
  
  return policyAreas;
}

export function parseVoteDate(dateString: string): Date {
  // Handle various date formats
  const formats = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
  ];
  
  for (const format of formats) {
    if (format.test(dateString)) {
      return new Date(dateString);
    }
  }
  
  // Fallback to Date constructor
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}`);
  }
  
  return date;
}

export function normalizeVoteChoice(choice: string): 'for' | 'against' | 'abstain' | 'absent' {
  const normalized = choice.toLowerCase().trim();
  
  switch (normalized) {
    case 'for':
    case 'yes':
    case 'in favour':
      return 'for';
    case 'against':
    case 'no':
    case 'opposed':
      return 'against';
    case 'abstain':
    case 'abstention':
    case 'abstained':
      return 'abstain';
    case 'absent':
    case 'not voting':
    case 'did not vote':
    case 'no vote':
      return 'absent';
    default:
      console.warn(`Unknown vote choice: ${choice}, defaulting to absent`);
      return 'absent';
  }
}
