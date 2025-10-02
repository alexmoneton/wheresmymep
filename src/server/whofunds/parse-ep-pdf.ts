/**
 * Specialized parser for European Parliament financial declaration PDFs
 * Handles the official EP declaration format (sections A-I)
 */

import pdf from 'pdf-parse';
import {
  normalizeCurrencyToEUR,
  parseDateLoose,
  mapCategory,
  mapEntityType,
  detectPeriod,
  normalizeEntityName,
  extractExcerpt
} from './normalize';

/**
 * Clean German entity names to extract proper organization names
 */
function cleanGermanEntityName(entityName: string): string {
  let cleaned = entityName.trim();
  
  // Remove common German prepositions and articles
  cleaned = cleaned.replace(/^(des|der|die|das|dem|den|ein|eine|eines|einer|einem)\s+/i, '').trim();
  
  // Handle specific German organization patterns
  const patterns = [
    // Foundation patterns
    { pattern: /^(stiftungsrates?\s+der\s+stiftung)/i, replacement: 'Foundation Board' },
    { pattern: /^(stiftungsrat)/i, replacement: 'Foundation Board' },
    
    // Worker organizations
    { pattern: /^(arbeiter-samariter-bund)/i, replacement: 'Arbeiter-Samariter-Bund' },
    { pattern: /^(arbeiter-samariter)/i, replacement: 'Arbeiter-Samariter-Bund' },
    
    // Ring organizations
    { pattern: /^(weissen\s+ring)/i, replacement: 'Weisser Ring' },
    { pattern: /^(weisser\s+ring)/i, replacement: 'Weisser Ring' },
    
    // Regional organizations
    { pattern: /^(thüringer\s+gesellschaft)/i, replacement: 'Thüringer Gesellschaft' },
    { pattern: /^(landesarbeitskreis)/i, replacement: 'Landesarbeitskreis' },
    { pattern: /^(landesverband)/i, replacement: 'Landesverband' },
    
    // Board patterns
    { pattern: /^(aufsichtsrates?\s+der)/i, replacement: '' },
    { pattern: /^(vorstand)/i, replacement: 'Board' },
    
    // European Parliament
    { pattern: /^(europäischen\s+parlaments)/i, replacement: 'European Parliament' },
    { pattern: /^(europäisches\s+parlament)/i, replacement: 'European Parliament' },
    
    // Europa-Union
    { pattern: /^(europa-union)/i, replacement: 'Europa-Union' },
    
    // International organizations
    { pattern: /^(international\s+fire\s+and\s+rescue)/i, replacement: 'International Fire and Rescue' },
    
    // Bürger organizations
    { pattern: /^(bürger\s+europas)/i, replacement: 'Bürger Europas' },
  ];
  
  for (const { pattern, replacement } of patterns) {
    if (cleaned.match(pattern)) {
      cleaned = cleaned.replace(pattern, replacement).trim();
      break;
    }
  }
  
  // Clean up any remaining German articles
  cleaned = cleaned.replace(/\s+(der|die|das|des|dem|den)\s+/gi, ' ').trim();
  
  // Capitalize properly
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned || entityName; // Fallback to original if cleaning failed
}

interface ParsedEntry {
  category: string;
  entity_name: string;
  entity_type?: string;
  role?: string;
  amount_eur_min?: number;
  amount_eur_max?: number;
  period?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  source_excerpt?: string;
}

interface ParseResult {
  income_and_interests: ParsedEntry[];
  gifts_travel: Array<{
    sponsor: string;
    item?: string;
    value_eur?: number;
    date?: string;
    notes?: string;
    source_excerpt?: string;
  }>;
  confidence: 'high' | 'medium' | 'low';
  issues: string[];
}

/**
 * Extract section content from EP PDF
 * EP uses format: (A) description... (B) description... etc.
 */
function extractEPSections(text: string): Map<string, string> {
  const sections = new Map<string, string>();
  
  // Find all section markers
  const sectionMarkers: Array<{ letter: string; index: number }> = [];
  const markerRegex = /\n\(([A-I])\)\s+/g;
  let match;
  
  while ((match = markerRegex.exec(text)) !== null) {
    sectionMarkers.push({
      letter: match[1],
      index: match.index + match[0].length
    });
  }
  
  // Extract content between markers
  for (let i = 0; i < sectionMarkers.length; i++) {
    const current = sectionMarkers[i];
    const next = sectionMarkers[i + 1];
    
    const endIndex = next ? next.index : text.length;
    const content = text.substring(current.index, endIndex).trim();
    
    if (content.length > 20) {
      sections.set(current.letter, content);
    }
  }
  
  return sections;
}

/**
 * Parse a numbered row from EP declaration
 * Format: "1. Activity name[TAB/SPACES]Income[TAB/SPACES]Period"
 */
function parseEPRow(rowText: string, sectionLetter: string): ParsedEntry | null {
  // Remove the number prefix
  const withoutNumber = rowText.replace(/^\d+\.\s*/, '').trim();
  
  // Skip empty or "None" rows
  if (withoutNumber.match(/^(Inga|None|Nil|N\/A|-|X)$/i) || withoutNumber.length < 5) {
    return null;
  }
  
  // Skip if it's a header row
  if (withoutNumber.match(/^(Yrkesmässig|Verksamhet|Professional|Activity|Inkomst|Income)/i)) {
    return null;
  }
  
  // EP PDFs concatenate columns without clear separators
  // Common patterns to split on:
  // - "ActivityNamePublic Information" → split before "Public"
  // - "ActivityNameX" → split before "X" (end marker)
  // - "ActivityName[PERIOD]" → split before period keywords
  
  let activityText = withoutNumber;
  let incomeText = '';
  let periodText = '';
  
  // Try to split before common period words (multilingual)
  const periodMatch = withoutNumber.match(/(.+?)(Månadsvis|Monthly|Annualy|Per year|årlig|mensuel|mensile|anual|Yearly|One-off|Mensile|Annuel|Annuale|Anual|Mensual)(.*)$/i);
  if (periodMatch) {
    activityText = periodMatch[1].trim();
    periodText = periodMatch[2].trim();
  }
  
  // Try to split before "Public Information" (multilingual)
  const publicInfoMatch = activityText.match(/(.+?)(Public Information|Offentlig information|Öffentliche|Information publique|Información pública|Informazione pubblica|Informação pública|Publica informacija)(.*)$/i);
  if (publicInfoMatch) {
    activityText = publicInfoMatch[1].trim();
    incomeText = publicInfoMatch[2].trim();
  }
  
  // Try to split before trailing "X" (meaning unpaid/no income)
  const xMatch = activityText.match(/(.+?)X\s*$/);
  if (xMatch) {
    activityText = xMatch[1].trim();
    incomeText = 'Unpaid';
  }
  
  if (activityText.length < 5) return null;
  
  // Determine category based on section and content (multilingual)
  let category: ParsedEntry['category'] = 'other';
  if (sectionLetter === 'A' || sectionLetter === 'B') {
    category = 'outside_activity';
  } else if (activityText.match(/(board|director|styrelse|conseil|consejo|conselho|vorstand|president|presidente|chair|vorsitz)/i)) {
    category = 'board_membership';
  } else if (activityText.match(/(consult|advisor|rådgiv|conseil|asesor|consultor|berater)/i)) {
    category = 'consultancy';
  } else if (activityText.match(/(teach|professor|university|universit|enseign|docente|profesor|lehrer)/i)) {
    category = 'teaching';
  } else if (activityText.match(/(speak|conferenc|presentation|présentation|conferencia)/i)) {
    category = 'speaking';
  } else if (activityText.match(/(media|journal|press|média|prensa|stampa)/i)) {
    category = 'media';
  }
  
  // Clean the base entity name
  let baseEntityName = activityText.split(/[,;]/)[0];
  
  // Apply German cleaning if it looks like German text
  if (baseEntityName.match(/[äöüß]/i) || baseEntityName.match(/\b(des|der|die|das|mitglied|vorsitzende)\b/i)) {
    baseEntityName = cleanGermanEntityName(baseEntityName);
  }
  
  const entry: ParsedEntry = {
    category,
    entity_name: normalizeEntityName(baseEntityName),
    entity_type: mapEntityType(activityText),
    source_excerpt: extractExcerpt(rowText),
    notes: incomeText || undefined
  };
  
  // Extract role and entity from activity text (multilingual)
  if (activityText.match(/(member|mitglied|membre|miembro|membro|board|director|consultant|advisor|vorsitzende|president|presidente|chair|presidente|coordinatore|coordinador)/i)) {
    // Pattern 1: "Member of board / Mitglied der ..." (MOST SPECIFIC - check first)
    let roleEntityMatch = activityText.match(/^(member\s+of\s+board|mitglied\s+(?:der|des)?\s*vorstand|membre\s+du\s+conseil|miembro\s+del\s+consejo|membro\s+do\s+conselho)\s+(.+)$/i);
    
    if (roleEntityMatch) {
      const entityName = roleEntityMatch[2].trim();
      entry.role = `Board member`;
      entry.entity_name = normalizeEntityName(entityName);
      entry.category = 'board_membership';
    } else {
      // Pattern 2: "Member of / Mitglied des/der ..." (GENERAL)
      roleEntityMatch = activityText.match(/^(member\s+of\s+(?:the\s+)?|mitglied\s+(?:des|der)\s+|membre\s+de\s+|miembro\s+de\s+|membro\s+de\s+)(.*?)$/i);
      
      if (roleEntityMatch) {
        const entityName = roleEntityMatch[2].trim();
        entry.role = activityText.replace(/\s+/g, ' ').trim();
        entry.entity_name = normalizeEntityName(entityName);
      } else {
        // Pattern 3: "Vorsitzende/r / Président/e / Presidente ..." (chairman/chairwoman)
        roleEntityMatch = activityText.match(/^(stellvertretende\s+)?vorsitzende[r]?\s+(.+)$/i) ||
                         activityText.match(/^(vice\s+)?président[e]?\s+(.+)$/i) ||
                         activityText.match(/^(vice\s+)?presidente\s+(.+)$/i) ||
                         activityText.match(/^(vice\s+)?presidente\s+(.+)$/i) ||
                         activityText.match(/^(landesvorsitzende|regionalvorsitzende)\s+(.+)$/i);
        
        if (roleEntityMatch) {
          const isDeputy = roleEntityMatch[1];
          let entityName = roleEntityMatch[2].trim();
          
          // Comprehensive German entity name cleaning
          entityName = cleanGermanEntityName(entityName);
          
          entry.role = isDeputy ? 'Deputy Chair' : 'Chair';
          entry.entity_name = normalizeEntityName(entityName);
          entry.category = 'board_membership';
        } else {
          // Pattern 4: "Coordinator / Coordinatore / Coordinador"
          roleEntityMatch = activityText.match(/^(coordinatore|coordinador|coordinateur)\s+(.+)$/i);
          
          if (roleEntityMatch) {
            const entityName = roleEntityMatch[2].trim();
            entry.role = 'Coordinator';
            entry.entity_name = normalizeEntityName(entityName);
            entry.category = 'outside_activity';
          } else {
            // Pattern 5: Generic fallback
            const roleMatch = activityText.match(/^(.*?)(member|mitglied|membre|miembro|membro|board|director|vorsitz|president|presidente|chair)(.*?)$/i);
            if (roleMatch) {
              entry.role = activityText.replace(/\s+/g, ' ').trim();
              // Extract entity (usually comes after "of" / "der" / "des" / "de")
              const ofMatch = activityText.match(/(?:of|at|for|der|des|de|du|del|do)\s+(?:the\s+)?(.+?)$/i);
              if (ofMatch) {
                entry.entity_name = normalizeEntityName(ofMatch[1].split(/[,;]/)[0]);
              }
            }
          }
        }
      }
    }
  }
  
  // Handle period
  if (periodText) {
    const period = detectPeriod(periodText);
    if (period !== 'unknown') {
      entry.period = period;
    }
  }
  
  // Check income text for amounts
  if (incomeText && incomeText !== 'Unpaid' && !incomeText.match(/public\s+information/i)) {
    const currency = normalizeCurrencyToEUR(incomeText);
    if (currency.min !== undefined && currency.min >= 100) {
      entry.amount_eur_min = currency.min;
      entry.amount_eur_max = currency.max;
    }
  }
  
  return entry;
}

/**
 * Main EP PDF parser
 */
export async function parseEPDeclarationPDF(buffer: Buffer): Promise<ParseResult> {
  const result: ParseResult = {
    income_and_interests: [],
    gifts_travel: [],
    confidence: 'medium',
    issues: []
  };

  try {
    const data = await pdf(buffer);
    const text = data.text;

    // Extract sections
    const sections = extractEPSections(text);

    // Section (A): Professional activities (last 3 years)
    const sectionA = sections.get('A');
    if (sectionA) {
      // Match numbered rows more liberally
      const rows = sectionA.match(/^\d+\.\s+.+$/gm) || [];
      console.log(`  [DEBUG] Section A found ${rows.length} rows`);
      for (const row of rows) {
        const entry = parseEPRow(row, 'A');
        if (entry && entry.entity_name.length > 3) {
          result.income_and_interests.push(entry);
        }
      }
    } else {
      result.issues.push('Section A not found in PDF');
    }

    // Section (B): Parallel paid activities > 5,000 EUR
    const sectionB = sections.get('B');
    if (sectionB) {
      const rows = sectionB.match(/\d+\.\s+[^\n]+/g) || [];
      for (const row of rows) {
        const entry = parseEPRow(row, 'B');
        if (entry && entry.entity_name.length > 3) {
          // Section B is specifically for paid activities
          entry.category = 'outside_activity';
          entry.notes = 'Paid activity >5,000 EUR/year';
          result.income_and_interests.push(entry);
        }
      }
    }

    // Section (C): Board memberships
    const sectionC = sections.get('C');
    if (sectionC) {
      const rows = sectionC.match(/\d+\.\s+[^\n]+/g) || [];
      for (const row of rows) {
        const entry = parseEPRow(row, 'C');
        if (entry && entry.entity_name.length > 3) {
          entry.category = 'board_membership';
          result.income_and_interests.push(entry);
        }
      }
    }

    // Section (D): Shareholdings/ownership
    const sectionD = sections.get('D');
    if (sectionD) {
      const rows = sectionD.match(/\d+\.\s+[^\n]+/g) || [];
      for (const row of rows) {
        const entry = parseEPRow(row, 'D');
        if (entry && entry.entity_name.length > 3) {
          entry.category = 'ownership';
          result.income_and_interests.push(entry);
        }
      }
    }

    // Section (E): Gifts and hospitality
    const sectionE = sections.get('E');
    if (sectionE) {
      const rows = sectionE.match(/\d+\.\s+[^\n]+/g) || [];
      for (const row of rows) {
        const gift = parseGiftRow(row);
        if (gift) {
          result.gifts_travel.push(gift);
        }
      }
    }

    // Assess quality
    const totalEntries = result.income_and_interests.length + result.gifts_travel.length;
    
    if (totalEntries === 0) {
      result.confidence = 'low';
      result.issues.push('No financial data extracted from PDF');
    } else if (totalEntries > 0 && totalEntries < 3) {
      result.confidence = 'medium';
    } else {
      result.confidence = 'medium'; // Keep medium for PDF (never high without manual review)
    }

    // Aggressive deduplication to clean up messy entries
    const seen = new Set<string>();
    result.income_and_interests = result.income_and_interests.filter(entry => {
      // Create a flexible key for deduplication
      const entityKey = entry.entity_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const roleKey = entry.role?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
      const key = `${entityKey}|${roleKey}|${entry.category}`;
      
      // Also check for partial matches (e.g., "arbeiter-samariter" vs "arbeiter-samariter-bund")
      const partialMatches = Array.from(seen).some(existingKey => {
        const [existingEntity] = existingKey.split('|');
        return entityKey.includes(existingEntity) || existingEntity.includes(entityKey);
      });
      
      if (seen.has(key) || partialMatches) {
        return false; // Skip duplicate or partial match
      }
      seen.add(key);
      return true;
    });
    
    // Sort entries by entity name for better presentation
    result.income_and_interests.sort((a, b) => a.entity_name.localeCompare(b.entity_name));

    // Add note about which sections were found
    const sectionsFound = Array.from(sections.keys()).join(', ');
    if (sectionsFound) {
      result.issues.push(`Sections found: ${sectionsFound}`);
    }

  } catch (error) {
    result.confidence = 'low';
    result.issues.push(`PDF parse error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  return result;
}

function parseGiftRow(rowText: string): any | null {
  const withoutNumber = rowText.replace(/^\d+\.\s*/, '').trim();
  
  if (withoutNumber.match(/^(Inga|None|Nil|N\/A|-|X)$/i) || withoutNumber.length < 5) {
    return null;
  }
  
  const parts = withoutNumber.split(/\s{3,}|\t+/).filter(p => p.trim().length > 0);
  
  const gift: any = {
    sponsor: normalizeEntityName(parts[0]),
    item: parts.length > 1 ? parts[1] : withoutNumber,
    source_excerpt: extractExcerpt(rowText)
  };
  
  // Look for currency
  for (const part of parts) {
    const currency = normalizeCurrencyToEUR(part);
    if (currency.min !== undefined) {
      gift.value_eur = currency.min;
    }
    
    const date = parseDateLoose(part);
    if (date) {
      gift.date = date;
    }
  }
  
  return gift;
}

export default parseEPDeclarationPDF;

