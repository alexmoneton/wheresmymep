#!/usr/bin/env tsx
/**
 * Discover declaration URLs from MEP profile pages
 * Usage: npm run etl:whofunds:discover
 */

import fs from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';
import pLimit from 'p-limit';
import { findDeclarationURL } from '../../src/server/whofunds/sources';
import { fetchWithRetry, delay, saveMetadata, getMetadata } from '../../src/server/whofunds/cache';

// Environment guard
if (process.env.ALLOW_WHOFUNDS_FETCH !== 'true') {
  console.error('❌ ALLOW_WHOFUNDS_FETCH must be set to "true"');
  console.error('   Set: export ALLOW_WHOFUNDS_FETCH=true');
  process.exit(1);
}

interface SeedMEP {
  mep_id: string;
  name: string;
  profile_url: string;
  country: string;
  party: string;
}

const SEED_FILE = path.join(__dirname, 'seed-list.csv');
const CONCURRENT_REQUESTS = 3;
const DELAY_MS = 2500;

async function discoverDeclaration(mep: SeedMEP, index: number, total: number): Promise<void> {
  console.log(`\n[${index + 1}/${total}] 🔍 ${mep.name} (${mep.mep_id})`);
  
  try {
    // Check if we already have it cached
    const existing = await getMetadata(mep.mep_id);
    if (existing?.declaration_url) {
      console.log(`  ✓ Already discovered: ${existing.declaration_url}`);
      return;
    }

    // Construct declaration URL from MEP name
    // EP pattern: /meps/en/{id}/{NAME_SLUG}/declarations
    const nameSlug = mep.name
      .toUpperCase()
      .replace(/[àáâãäå]/g, 'A')
      .replace(/[èéêë]/g, 'E')
      .replace(/[ìíîï]/g, 'I')
      .replace(/[òóôõö]/g, 'O')
      .replace(/[ùúûü]/g, 'U')
      .replace(/[ñ]/g, 'N')
      .replace(/[ç]/g, 'C')
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    const declarationURL = `https://www.europarl.europa.eu/meps/en/${mep.mep_id}/${nameSlug}/declarations`;
    
    console.log(`  🔗 Constructed URL: ${declarationURL}`);

    // Test if URL is valid by HEAD request
    try {
      const testResponse = await fetchWithRetry(declarationURL, { method: 'HEAD' });
      if (testResponse.ok) {
        console.log(`  ✅ Valid declaration URL`);
        
        // Save to metadata cache
        await saveMetadata(mep.mep_id, {
          mep_id: mep.mep_id,
          name: mep.name,
          country: mep.country,
          party: mep.party,
          declaration_url: declarationURL,
          discovered_at: new Date().toISOString()
        });
      } else {
        console.log(`  ⚠️  URL returned ${testResponse.status}`);
        await saveMetadata(mep.mep_id, {
          mep_id: mep.mep_id,
          name: mep.name,
          country: mep.country,
          party: mep.party,
          declaration_url: null,
          discovered_at: new Date().toISOString(),
          note: `Declaration page returned ${testResponse.status}`
        });
      }
    } catch (error) {
      console.log(`  ⚠️  URL not accessible`);
      await saveMetadata(mep.mep_id, {
        mep_id: mep.mep_id,
        name: mep.name,
        country: mep.country,
        party: mep.party,
        declaration_url: null,
        discovered_at: new Date().toISOString(),
        note: 'Declaration URL not accessible'
      });
    }

    // Respectful delay
    await delay(DELAY_MS);

  } catch (error) {
    console.error(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    
    await saveMetadata(mep.mep_id, {
      mep_id: mep.mep_id,
      name: mep.name,
      country: mep.country,
      party: mep.party,
      error: error instanceof Error ? error.message : 'Unknown error',
      discovered_at: new Date().toISOString()
    });
  }
}

async function main() {
  console.log('🚀 WhoFunds Declaration Discovery\n');
  
  // Load seed list
  const csvContent = await fs.readFile(SEED_FILE, 'utf-8');
  const { data } = Papa.parse<SeedMEP>(csvContent, {
    header: true,
    skipEmptyLines: true
  });

  console.log(`📋 Loaded ${data.length} MEPs from seed list`);
  console.log(`🔧 Concurrency: ${CONCURRENT_REQUESTS}, Delay: ${DELAY_MS}ms\n`);

  // Create rate-limited processor
  const limit = pLimit(CONCURRENT_REQUESTS);

  // Process all MEPs
  const tasks = data.map((mep, index) =>
    limit(() => discoverDeclaration(mep, index, data.length))
  );

  await Promise.all(tasks);

  // Summary
  console.log('\n\n📊 Discovery Complete!\n');
  
  let foundCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;

  for (const mep of data) {
    const meta = await getMetadata(mep.mep_id);
    if (meta?.declaration_url) foundCount++;
    else if (meta?.error) errorCount++;
    else notFoundCount++;
  }

  console.log(`✅ Found: ${foundCount}`);
  console.log(`⚠️  Not found: ${notFoundCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📁 Total: ${data.length}\n`);
}

main().catch(console.error);
