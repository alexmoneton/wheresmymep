/**
 * Normalization helpers for WhoFunds data parsing
 * Handles currency conversion, date parsing, and category mapping
 */

/**
 * Normalize currency string to EUR amount
 * Handles various formats: "€1,000", "1 000 EUR", "1000-5000", etc.
 */
export function normalizeCurrencyToEUR(text: string): {
  min?: number;
  max?: number;
  confidence: 'high' | 'medium' | 'low';
} {
  if (!text) return { confidence: 'low' };

  // Remove currency symbols and normalize
  let cleaned = text
    .replace(/[€$£]/g, '')
    .replace(/EUR|euro|euros/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Handle ranges: "1000-5000", "1,000 - 5,000"
  const rangeMatch = cleaned.match(/(\d[\d\s,.]*)[\s-]+(?:to|à)?[\s-]+(\d[\d\s,.]*)/i);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1].replace(/[\s,]/g, ''));
    const max = parseFloat(rangeMatch[2].replace(/[\s,]/g, ''));
    if (!isNaN(min) && !isNaN(max)) {
      return { min, max, confidence: 'high' };
    }
  }

  // Single amount: "1,000" or "1 000"
  const singleMatch = cleaned.match(/(\d[\d\s,.]*)/);
  if (singleMatch) {
    const amount = parseFloat(singleMatch[1].replace(/[\s,]/g, ''));
    if (!isNaN(amount)) {
      return { min: amount, max: amount, confidence: 'high' };
    }
  }

  return { confidence: 'low' };
}

/**
 * Parse date from various formats
 * Supports: DD/MM/YYYY, YYYY-MM-DD, DD.MM.YYYY, Month YYYY, etc.
 */
export function parseDateLoose(text: string): string | null {
  if (!text) return null;

  const cleaned = text.trim();

  // ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  // DD/MM/YYYY or DD.MM.YYYY
  const ddmmyyyyMatch = cleaned.match(/(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Month YYYY (e.g., "January 2024")
  const monthYearMatch = cleaned.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i);
  if (monthYearMatch) {
    const months: Record<string, string> = {
      january: '01', february: '02', march: '03', april: '04',
      may: '05', june: '06', july: '07', august: '08',
      september: '09', october: '10', november: '11', december: '12'
    };
    const month = months[monthYearMatch[1].toLowerCase()];
    const year = monthYearMatch[2];
    return `${year}-${month}-01`;
  }

  // Just year: "2024"
  if (/^\d{4}$/.test(cleaned)) {
    return `${cleaned}-01-01`;
  }

  return null;
}

/**
 * Map raw text to standardized category
 */
export function mapCategory(rawText: string): 'outside_activity' | 'board_membership' | 'honoraria' | 'ownership' | 'consultancy' | 'teaching' | 'writing' | 'other' {
  const lower = rawText.toLowerCase();

  if (lower.includes('board') || lower.includes('director') || lower.includes('conseil')) {
    return 'board_membership';
  }
  if (lower.includes('honorar') || lower.includes('speaking') || lower.includes('prize') || lower.includes('award')) {
    return 'honoraria';
  }
  if (lower.includes('sharehold') || lower.includes('ownership') || lower.includes('partner') || lower.includes('capital')) {
    return 'ownership';
  }
  if (lower.includes('consult') || lower.includes('advisor') || lower.includes('conseil')) {
    return 'consultancy';
  }
  if (lower.includes('teach') || lower.includes('professor') || lower.includes('lecturer') || lower.includes('university')) {
    return 'teaching';
  }
  if (lower.includes('author') || lower.includes('writer') || lower.includes('publication') || lower.includes('journalist')) {
    return 'writing';
  }
  if (lower.includes('outside') || lower.includes('professional') || lower.includes('activity') || lower.includes('activité')) {
    return 'outside_activity';
  }

  return 'other';
}

/**
 * Map entity type from text
 */
export function mapEntityType(rawText: string): 'company' | 'ngo' | 'foundation' | 'university' | 'public_body' | 'media' | 'political_party' | 'other' | 'unknown' {
  const lower = rawText.toLowerCase();

  if (lower.match(/\b(ltd|gmbh|inc|sa|sas|ag|corp|llc|limited|sprl)\b/i)) {
    return 'company';
  }
  if (lower.includes('foundation') || lower.includes('fundaci') || lower.includes('fondation')) {
    return 'foundation';
  }
  if (lower.includes('ngo') || lower.includes('non-profit') || lower.includes('association')) {
    return 'ngo';
  }
  if (lower.includes('university') || lower.includes('universit') || lower.includes('college')) {
    return 'university';
  }
  if (lower.includes('ministry') || lower.includes('government') || lower.includes('public') || lower.includes('municipal')) {
    return 'public_body';
  }
  if (lower.includes('media') || lower.includes('newspaper') || lower.includes('tv') || lower.includes('radio') || lower.includes('press')) {
    return 'media';
  }
  if (lower.includes('party') || lower.includes('parti') || lower.includes('political')) {
    return 'political_party';
  }

  return 'unknown';
}

/**
 * Detect period from text
 */
export function detectPeriod(text: string): 'monthly' | 'annual' | 'one-off' | 'unknown' {
  const lower = text.toLowerCase();

  if (lower.match(/\b(per month|monthly|\/month|mois|mensuel)\b/i)) {
    return 'monthly';
  }
  if (lower.match(/\b(per year|annual|yearly|\/year|an|annuel)\b/i)) {
    return 'annual';
  }
  if (lower.match(/\b(one-off|once|single|unique)\b/i)) {
    return 'one-off';
  }

  return 'unknown';
}

/**
 * Clean and normalize entity name
 */
export function normalizeEntityName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^[–-]\s*/, '') // Remove leading dashes
    .replace(/\s*[–-]$/, ''); // Remove trailing dashes
}

/**
 * Extract excerpt from larger text (for source_excerpt field)
 */
export function extractExcerpt(text: string, maxLength: number = 200): string {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return cleaned.substring(0, maxLength) + '...';
}
