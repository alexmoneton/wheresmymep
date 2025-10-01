/**
 * HTML parser for European Parliament financial declarations
 * Extracts structured data from HTML declaration pages
 */

import * as cheerio from 'cheerio';
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
 * Extract PDF URL from EP declarations page
 */
export function extractPDFUrl(html: string): string | null {
  const $ = cheerio.load(html);
  
  // Look for PDF links in the declarations list
  let pdfUrl: string | null = null;
  
  $('a[href*=".pdf"]').each((_, link) => {
    const href = $(link).attr('href');
    const text = $(link).text().toLowerCase();
    
    // Look for "declaration" or "private interests" in link text
    if (href && (text.includes('declaration') || text.includes('private') || text.includes('interest'))) {
      if (!href.startsWith('http')) {
        pdfUrl = `https://www.europarl.europa.eu${href}`;
      } else {
        pdfUrl = href;
      }
      return false; // Stop after first match
    }
  });
  
  // If not found, try any PDF in the declarations section
  if (!pdfUrl) {
    $('.erpl_meps-declaration a[href*=".pdf"]').each((_, link) => {
      const href = $(link).attr('href');
      if (href) {
        if (!href.startsWith('http')) {
          pdfUrl = `https://www.europarl.europa.eu${href}`;
        } else {
          pdfUrl = href;
        }
        return false;
      }
    });
  }
  
  return pdfUrl;
}

/**
 * Parse HTML declaration page
 */
export function parseHTMLDeclaration(html: string): ParseResult {
  const $ = cheerio.load(html);
  const result: ParseResult = {
    income_and_interests: [],
    gifts_travel: [],
    confidence: 'medium',
    issues: []
  };

  try {
    // First check if this is an EP declarations page with PDF links
    const pdfUrl = extractPDFUrl(html);
    if (pdfUrl) {
      result.issues.push(`PDF found: ${pdfUrl} - should be parsed as PDF`);
      result.confidence = 'low';
      return result;
    }

    // Try to find tables with financial data
    // Only parse tables that have financial keywords in headings
    $('table').each((_, table) => {
      const $table = $(table);
      
      // Look for table header/caption
      const tableHeader = $table.find('caption, thead th').text().toLowerCase();
      const tableText = $table.text().toLowerCase();
      
      // Skip if table looks like metadata (birth, contact, etc.)
      if (tableText.match(/(date of birth|born|email|telephone|address)/i)) {
        return; // Skip this table
      }
      
      // Only parse if contains financial keywords
      if (!tableText.match(/(remunerat|paid|activit|income|gift|travel|board|shareholding)/i)) {
        return; // Skip non-financial tables
      }
      
      // Identify table type by heading/content
      if (tableText.match(/(outside|paid|professional|activities|activit)/)) {
        parseActivitiesTable($table, result);
      } else if (tableText.match(/(gift|travel|support|invitation)/)) {
        parseGiftsTable($table, result);
      } else if (tableText.match(/(board|director|membership|conseil)/)) {
        parseBoardTable($table, result);
      } else if (tableText.match(/(sharehold|ownership|partner|capital)/)) {
        parseOwnershipTable($table, result);
      }
    });

    // Try definition lists (dl/dt/dd)
    $('dl').each((_, dl) => {
      const $dl = $(dl);
      const dlText = $dl.text().toLowerCase();
      
      // Skip if looks like metadata
      if (dlText.match(/(date of birth|born|email)/i)) {
        return;
      }
      
      parseDefinitionList($dl, result);
    });

    // Assess confidence
    if (result.income_and_interests.length === 0 && result.gifts_travel.length === 0) {
      result.confidence = 'low';
      result.issues.push('No structured financial data found in HTML');
    } else if (result.income_and_interests.length > 0 && 
               result.income_and_interests.every(e => e.amount_eur_min || e.amount_eur_max)) {
      result.confidence = 'high';
    }

  } catch (error) {
    result.confidence = 'low';
    result.issues.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  return result;
}

function parseActivitiesTable($table: cheerio.Cheerio, result: ParseResult) {
  $table.find('tr').each((i, row) => {
    if (i === 0) return; // Skip header

    const $row = $(row);
    const cells = $row.find('td, th').map((_, cell) => $(cell).text().trim()).get();
    
    if (cells.length < 2) return;

    const entry: ParsedEntry = {
      category: 'outside_activity',
      entity_name: normalizeEntityName(cells[0] || 'Unknown'),
      entity_type: mapEntityType(cells[0] || ''),
      source_excerpt: extractExcerpt($row.text())
    };

    // Try to extract role, amount, period from other cells
    for (let j = 1; j < cells.length; j++) {
      const cell = cells[j];
      
      // Check for currency
      if (cell.match(/[€$£\d]/)) {
        const currency = normalizeCurrencyToEUR(cell);
        if (currency.min !== undefined) {
          entry.amount_eur_min = currency.min;
          entry.amount_eur_max = currency.max;
        }
      }
      
      // Check for period
      const period = detectPeriod(cell);
      if (period !== 'unknown') {
        entry.period = period;
      }
      
      // Check for dates
      const date = parseDateLoose(cell);
      if (date && !entry.start_date) {
        entry.start_date = date;
      }
      
      // If looks like role/position
      if (cell.length > 5 && cell.length < 100 && !cell.match(/[€$£\d]/)) {
        entry.role = cell;
      }
    }

    result.income_and_interests.push(entry);
  });
}

function parseGiftsTable($table: cheerio.Cheerio, result: ParseResult) {
  $table.find('tr').each((i, row) => {
    if (i === 0) return; // Skip header

    const $row = $(row);
    const cells = $row.find('td, th').map((_, cell) => $(cell).text().trim()).get();
    
    if (cells.length < 2) return;

    const gift: ParsedEntry['category'] extends never ? never : any = {
      sponsor: normalizeEntityName(cells[0] || 'Unknown'),
      item: cells[1] || '',
      source_excerpt: extractExcerpt($row.text())
    };

    // Try to extract value and date
    for (let j = 0; j < cells.length; j++) {
      const cell = cells[j];
      
      // Check for currency
      if (cell.match(/[€$£\d]/)) {
        const currency = normalizeCurrencyToEUR(cell);
        if (currency.min !== undefined) {
          gift.value_eur = currency.min;
        }
      }
      
      // Check for date
      const date = parseDateLoose(cell);
      if (date) {
        gift.date = date;
      }
    }

    result.gifts_travel.push(gift);
  });
}

function parseBoardTable($table: cheerio.Cheerio, result: ParseResult) {
  $table.find('tr').each((i, row) => {
    if (i === 0) return;

    const $row = $(row);
    const cells = $row.find('td, th').map((_, cell) => $(cell).text().trim()).get();
    
    if (cells.length < 1) return;

    const entry: ParsedEntry = {
      category: 'board_membership',
      entity_name: normalizeEntityName(cells[0] || 'Unknown'),
      entity_type: mapEntityType(cells[0] || ''),
      role: cells[1] || 'Board member',
      source_excerpt: extractExcerpt($row.text())
    };

    // Extract amounts and dates
    for (let j = 1; j < cells.length; j++) {
      const cell = cells[j];
      
      if (cell.match(/[€$£\d]/)) {
        const currency = normalizeCurrencyToEUR(cell);
        if (currency.min !== undefined) {
          entry.amount_eur_min = currency.min;
          entry.amount_eur_max = currency.max;
        }
      }
      
      const period = detectPeriod(cell);
      if (period !== 'unknown') {
        entry.period = period;
      }
    }

    result.income_and_interests.push(entry);
  });
}

function parseOwnershipTable($table: cheerio.Cheerio, result: ParseResult) {
  $table.find('tr').each((i, row) => {
    if (i === 0) return;

    const $row = $(row);
    const cells = $row.find('td, th').map((_, cell) => $(cell).text().trim()).get();
    
    if (cells.length < 1) return;

    const entry: ParsedEntry = {
      category: 'ownership',
      entity_name: normalizeEntityName(cells[0] || 'Unknown'),
      entity_type: 'company',
      notes: cells[1] || '',
      source_excerpt: extractExcerpt($row.text())
    };

    result.income_and_interests.push(entry);
  });
}

function parseDefinitionList($dl: cheerio.Cheerio, result: ParseResult) {
  $dl.find('dt').each((_, dt) => {
    const $dt = $(dt);
    const $dd = $dt.next('dd');
    
    if (!$dd.length) return;

    const term = $dt.text().trim();
    const definition = $dd.text().trim();
    
    if (!definition || definition.length < 5) return;

    const category = mapCategory(term);
    const entry: ParsedEntry = {
      category,
      entity_name: normalizeEntityName(definition.split(/[,;]/)[0]),
      entity_type: mapEntityType(definition),
      notes: definition,
      source_excerpt: extractExcerpt(`${term}: ${definition}`)
    };

    // Try to extract amounts
    const currency = normalizeCurrencyToEUR(definition);
    if (currency.min !== undefined) {
      entry.amount_eur_min = currency.min;
      entry.amount_eur_max = currency.max;
    }

    result.income_and_interests.push(entry);
  });
}

function parseParagraphBased($: cheerio.CheerioAPI, result: ParseResult) {
  // Last resort: try to find paragraphs with financial keywords
  $('p').each((_, p) => {
    const text = $(p).text().trim();
    
    if (text.length < 20 || text.length > 500) return;
    if (!text.match(/[€$£\d]/)) return;

    const category = mapCategory(text);
    const currency = normalizeCurrencyToEUR(text);
    
    const entry: ParsedEntry = {
      category,
      entity_name: normalizeEntityName(text.split(/[,;]/)[0]),
      entity_type: mapEntityType(text),
      notes: text,
      source_excerpt: extractExcerpt(text),
      ...(currency.min !== undefined && {
        amount_eur_min: currency.min,
        amount_eur_max: currency.max
      })
    };

    result.income_and_interests.push(entry);
  });
}

export default parseHTMLDeclaration;
