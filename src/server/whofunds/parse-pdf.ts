/**
 * PDF parser for financial declarations
 * Uses pdf-parse to extract text and apply heuristics
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
 * Parse PDF declaration
 */
export async function parsePDFDeclaration(buffer: Buffer): Promise<ParseResult> {
  const result: ParseResult = {
    income_and_interests: [],
    gifts_travel: [],
    confidence: 'low', // PDF parsing is inherently less reliable
    issues: []
  };

  try {
    const data = await pdf(buffer);
    const text = data.text;

    // Split into sections by headings
    const sections = splitIntoSections(text);

    // Parse each section
    for (const [heading, content] of Object.entries(sections)) {
      const category = mapCategory(heading);
      
      if (heading.toLowerCase().match(/(gift|travel|support)/)) {
        parseGiftsSection(content, result);
      } else if (content.match(/[€$£\d]/)) {
        parseIncomeSection(content, category, result);
      }
    }

    // If we found data, upgrade confidence
    if (result.income_and_interests.length > 0 || result.gifts_travel.length > 0) {
      result.confidence = 'medium';
    }

    if (result.income_and_interests.length === 0 && result.gifts_travel.length === 0) {
      result.issues.push('No financial data found in PDF');
    }

  } catch (error) {
    result.issues.push(`PDF parse error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  return result;
}

function splitIntoSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  
  // EP declarations use letter sections: (A), (B), (C), etc.
  const sectionPattern = /\(([A-Z])\)\s*"?([^\n]{10,200})/gi;
  const matches = Array.from(text.matchAll(sectionPattern));
  
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const sectionId = match[1];
    const heading = match[2].trim();
    const startIdx = match.index! + match[0].length;
    const endIdx = i < matches.length - 1 ? matches[i + 1].index! : text.length;
    const content = text.substring(startIdx, endIdx).trim();
    
    if (content.length > 20) {
      sections[`(${sectionId}) ${heading}`] = content;
    }
  }
  
  // Fallback: numbered sections
  if (Object.keys(sections).length === 0) {
    const numberedPattern = /^(\d+\.[\s\w]{2,100})$/gim;
    const numberedMatches = Array.from(text.matchAll(numberedPattern));
    
    for (let i = 0; i < numberedMatches.length; i++) {
      const match = numberedMatches[i];
      const heading = match[1].trim();
      const startIdx = match.index! + match[0].length;
      const endIdx = i < numberedMatches.length - 1 ? numberedMatches[i + 1].index! : text.length;
      const content = text.substring(startIdx, endIdx).trim();
      
      if (content.length > 10) {
        sections[heading] = content;
      }
    }
  }

  return sections;
}

function parseIncomeSection(content: string, category: string, result: ParseResult) {
  // Look for table-like structure with numbered rows
  // EP pattern: "1. Activity name | Income | Period"
  const rowPattern = /(\d+)\.\s+([^\n]{10,200})/g;
  const matches = Array.from(content.matchAll(rowPattern));
  
  for (const match of matches) {
    const rowNum = match[1];
    const rowContent = match[2].trim();
    
    // Skip if looks like regulatory text or template instructions
    if (rowContent.match(/(förordning|regulation|artikel|article|beslut|decision|nr \d{4}\/\d{4})/i)) {
      continue;
    }
    
    // Skip if it's just "Inga" (None) or similar
    if (rowContent.match(/^(inga|none|nil|n\/a|-)$/i)) {
      continue;
    }
    
    // Skip if too short or looks like a header
    if (rowContent.length < 5 || rowContent.match(/^(typ av|type of|inkomst|income|periodicitet|periodicity)/i)) {
      continue;
    }
    
    // Parse the row (usually: entity | income | period or entity | X)
    const parts = rowContent.split(/\||;|\t/).map(p => p.trim());
    const mainText = parts[0];
    
    const entry: ParsedEntry = {
      category,
      entity_name: normalizeEntityName(mainText.split(/,/)[0]),
      entity_type: mapEntityType(mainText),
      source_excerpt: extractExcerpt(rowContent)
    };

    // Check for currency in any part
    for (const part of parts) {
      if (part.match(/[€$£\d]/)) {
        const currency = normalizeCurrencyToEUR(part);
        if (currency.min !== undefined && currency.min > 100) { // Only accept amounts > 100 EUR to filter noise
          entry.amount_eur_min = currency.min;
          entry.amount_eur_max = currency.max;
        }
      }
      
      // Check for period
      const period = detectPeriod(part);
      if (period !== 'unknown') {
        entry.period = period;
      }
    }
    
    // Extract role from main text
    if (mainText.match(/(member|board|director|advisor|consultant)/i)) {
      const roleMatch = mainText.match(/(member|board|director|advisor|consultant[^,;.]*)/i);
      if (roleMatch) {
        entry.role = roleMatch[0];
      }
    }

    // Only add if we have meaningful entity name (not just numbers)
    if (entry.entity_name.length > 3 && !entry.entity_name.match(/^\d+$/)) {
      result.income_and_interests.push(entry);
    }
  }
}

function parseGiftsSection(content: string, result: ParseResult) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 10);
  
  for (const line of lines) {
    const gift: any = {
      sponsor: normalizeEntityName(line.split(/[,;]/)[0]),
      item: line,
      source_excerpt: extractExcerpt(line)
    };

    // Extract currency
    const currency = normalizeCurrencyToEUR(line);
    if (currency.min !== undefined) {
      gift.value_eur = currency.min;
    }

    // Extract date
    const date = parseDateLoose(line);
    if (date) {
      gift.date = date;
    }

    if (gift.sponsor.length > 3) {
      result.gifts_travel.push(gift);
    }
  }
}

export default parsePDFDeclaration;
