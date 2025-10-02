#!/usr/bin/env tsx
/**
 * Main ETL driver for WhoFunds
 * Fetches, parses, validates, and saves MEP financial declarations
 */

import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import pLimit from 'p-limit';
import { validateWhoFundsData, WhoFundsData } from '../../src/lib/zod/whofunds';
import { getMetadata, fetchWithRetry, delay, computeHash } from '../../src/server/whofunds/cache';
import { parseHTMLDeclaration } from '../../src/server/whofunds/parse-html';
import { parseEPDeclarationPDF } from '../../src/server/whofunds/parse-ep-pdf';

// Guard
if (process.env.ALLOW_WHOFUNDS_FETCH !== 'true') {
  console.error('❌ ALLOW_WHOFUNDS_FETCH must be "true"');
  process.exit(1);
}

const OUTPUT_DIR = path.join(process.cwd(), 'public/data/whofunds');
const SEED_FILE = path.join(__dirname, 'high-value-meps-seed-list.csv');
const CONCURRENT = 8; // Optimized for 364 high-value MEPs
const DELAY_MS = 1000;

interface Result {
  mepId: string;
  name: string;
  success: boolean;
  confidence?: string;
  error?: string;
}

async function fetchAndParse(mepId: string, name: string): Promise<Result> {
  try {
    // Get metadata
    const meta = await getMetadata(mepId);
    if (!meta?.declaration_url) {
      return { mepId, name, success: false, error: 'No declaration URL' };
    }

    const url = meta.declaration_url;
    console.log(`  📥 Fetching: ${url.substring(0, 60)}...`);

    const response = await fetchWithRetry(url);
    const contentType = response.headers.get('content-type') || '';
    
    let parsed;
    let finalMethod: 'html' | 'pdf' = 'html';
    
    if (contentType.includes('pdf') || url.endsWith('.pdf')) {
      // Direct PDF
      const buffer = Buffer.from(await response.arrayBuffer());
      parsed = await parseEPDeclarationPDF(buffer);
      finalMethod = 'pdf';
    } else {
      // HTML page - check if it contains PDF links
      const html = await response.text();
      const { parseHTMLDeclaration, extractPDFUrl } = await import('../../src/server/whofunds/parse-html');
      const pdfUrl = extractPDFUrl(html);
      
      if (pdfUrl) {
        // Download and parse the PDF using specialized EP parser
        console.log(`  📄 Found PDF: ${pdfUrl.substring(0, 60)}...`);
        const pdfResponse = await fetchWithRetry(pdfUrl);
        const buffer = Buffer.from(await pdfResponse.arrayBuffer());
        parsed = await parseEPDeclarationPDF(buffer);
        finalMethod = 'pdf';
      } else {
        // No PDF, parse HTML directly
        parsed = parseHTMLDeclaration(html);
        finalMethod = 'html';
      }
    }

    // Build final data
    const data: WhoFundsData = {
      mep_id: mepId,
      name,
      country: meta.country || 'Unknown',
      party: meta.party || 'Unknown',
      sources: {
        declaration_url: url
      },
      last_updated_utc: new Date().toISOString(),
      income_and_interests: parsed.income_and_interests as any,
      gifts_travel: parsed.gifts_travel as any,
      data_quality: {
        confidence: parsed.confidence,
        parsing_method: finalMethod,
        issues: parsed.issues
      }
    };

    // Validate
    validateWhoFundsData(data);

    // Save
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    const outPath = path.join(OUTPUT_DIR, `${mepId}.json`);
    await fs.writeFile(outPath, JSON.stringify(data, null, 2));

    console.log(`  ✅ Saved (${parsed.confidence} confidence, ${parsed.income_and_interests.length} entries)`);

    return { mepId, name, success: true, confidence: parsed.confidence };

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown';
    console.error(`  ❌ ${msg}`);
    return { mepId, name, success: false, error: msg };
  }
}

async function updateIndex(results: Result[]) {
  const index: any = {
    meta: {
      generated_at: new Date().toISOString(),
      total_meps: results.filter(r => r.success).length,
      last_full_refresh: new Date().toISOString()
    },
    meps: []
  };

  for (const result of results.filter(r => r.success)) {
    try {
      const dataPath = path.join(OUTPUT_DIR, `${result.mepId}.json`);
      const data: WhoFundsData = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
      
      const totalValue = data.income_and_interests.reduce((sum, item) => {
        return sum + (item.amount_eur_max || item.amount_eur_min || 0);
      }, 0);

      index.meps.push({
        mep_id: data.mep_id,
        name: data.name,
        country: data.country,
        party: data.party,
        last_updated_utc: data.last_updated_utc,
        total_income_entries: data.income_and_interests.length,
        total_gifts_entries: data.gifts_travel.length,
        total_estimated_value_eur: totalValue > 0 ? totalValue : undefined
      });
    } catch {}
  }

  // Sort by value desc
  index.meps.sort((a: any, b: any) => (b.total_estimated_value_eur || 0) - (a.total_estimated_value_eur || 0));

  await fs.writeFile(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify(index, null, 2));
  console.log(`\n📊 Updated index.json with ${index.meps.length} MEPs`);
}

async function main() {
  console.log('🚀 WhoFunds ETL - Fetch Declarations\n');

  const csvContent = await fs.readFile(SEED_FILE, 'utf-8');
  const { data } = Papa.parse<any>(csvContent, { header: true, skipEmptyLines: true });

  // Limit to first 10 for initial run
  const meps = data; // Process ALL MEPs
  console.log(`📋 Processing ALL ${meps.length} MEPs (complete dataset)\n`);

  const limit = pLimit(CONCURRENT);
  const results: Result[] = [];

  for (const [i, mep] of meps.entries()) {
    console.log(`\n[${i+1}/${meps.length}] 🔍 ${mep.name} (${mep.mep_id})`);
    const result = await limit(() => fetchAndParse(mep.mep_id, mep.name));
    results.push(result);
    await delay(DELAY_MS);
  }

  await updateIndex(results);

  // Summary
  const success = results.filter(r => r.success).length;
  const high = results.filter(r => r.confidence === 'high').length;
  const medium = results.filter(r => r.confidence === 'medium').length;
  const low = results.filter(r => r.confidence === 'low').length;

  console.log(`\n\n📈 Summary:`);
  console.log(`✅ Success: ${success}/${meps.length}`);
  console.log(`  High confidence: ${high}`);
  console.log(`  Medium confidence: ${medium}`);
  console.log(`  Low confidence: ${low}`);
}

main().catch(console.error);
