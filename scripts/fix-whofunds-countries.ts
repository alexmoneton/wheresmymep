#!/usr/bin/env tsx

/**
 * Fix country mappings in WhoFunds index by cross-referencing with main MEPs database
 */

import fs from 'fs';
import path from 'path';

interface MEP {
  mep_id: string;
  name: string;
  country: string;
  party: string;
}

interface WhoFundsIndexEntry {
  mep_id: string;
  name: string;
  country: string;
  party: string;
  last_updated_utc: string;
  total_income_entries: number;
  total_gifts_entries: number;
}

interface WhoFundsIndex {
  meta: {
    generated_at: string;
    total_meps: number;
    last_full_refresh?: string;
  };
  meps: WhoFundsIndexEntry[];
}

function fixCountries() {
  // Load main MEPs database
  const mepsPath = path.join(process.cwd(), 'public/data/meps.json');
  const meps: MEP[] = JSON.parse(fs.readFileSync(mepsPath, 'utf-8'));
  
  // Create lookup map
  const mepLookup = new Map<string, MEP>();
  meps.forEach(mep => {
    mepLookup.set(mep.mep_id, mep);
  });
  
  // Load WhoFunds index
  const whoFundsIndexPath = path.join(process.cwd(), 'public/data/whofunds/index.json');
  const whoFundsIndex: WhoFundsIndex = JSON.parse(fs.readFileSync(whoFundsIndexPath, 'utf-8'));
  
  console.log('🔍 Fixing country mappings...');
  
  let fixedCount = 0;
  
  // Fix each MEP's country and party
  whoFundsIndex.meps.forEach(mep => {
    const correctMEP = mepLookup.get(mep.mep_id);
    if (correctMEP) {
      const oldCountry = mep.country;
      const oldParty = mep.party;
      
      mep.country = correctMEP.country;
      mep.party = correctMEP.party;
      
      if (oldCountry !== correctMEP.country || oldParty !== correctMEP.party) {
        console.log(`✅ ${mep.name}: ${oldCountry} → ${correctMEP.country}, ${oldParty} → ${correctMEP.party}`);
        fixedCount++;
      }
    } else {
      console.log(`❌ No match found for MEP ID: ${mep.mep_id} (${mep.name})`);
    }
  });
  
  // Save updated index
  fs.writeFileSync(whoFundsIndexPath, JSON.stringify(whoFundsIndex, null, 2));
  
  console.log(`\n🎉 Fixed ${fixedCount} MEPs with incorrect country/party mappings`);
  console.log(`📊 Total MEPs in index: ${whoFundsIndex.meps.length}`);
}

if (require.main === module) {
  fixCountries();
}

export { fixCountries };
