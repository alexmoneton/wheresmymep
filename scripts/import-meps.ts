/**
 * Import MEPs into Postgres database
 * 
 * This script imports MEPs from the JSON file into the database
 * so they can be referenced by the vote import script.
 * 
 * Run with: npx tsx scripts/import-meps.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting MEP data import...\n');

  // Load MEPs from JSON
  const mepsJsonPath = path.join(__dirname, '..', 'public', 'data', 'meps.json');
  const mepsJson = JSON.parse(fs.readFileSync(mepsJsonPath, 'utf-8'));

  console.log(`📂 Loaded ${mepsJson.length} MEPs from JSON\n`);

  let imported = 0;
  let skipped = 0;
  let countriesCreated = 0;
  let partiesCreated = 0;

  // Track created countries and parties
  const countryMap = new Map<string, string>(); // country name -> DB ID
  const partyMap = new Map<string, string>(); // party name -> DB ID

  for (const mep of mepsJson) {
    try {
      // Skip if no mep_id
      if (!mep.mep_id) {
        console.log(`  ⚠️  Skipping ${mep.name} - no MEP ID`);
        skipped++;
        continue;
      }

      // Check if MEP already exists
      const existing = await prisma.mEP.findUnique({
        where: { epId: mep.mep_id }
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Get or create country
      let countryId = countryMap.get(mep.country);
      if (!countryId) {
        const countryCode = getCountryCode(mep.country);
        const countrySlug = mep.country.toLowerCase().replace(/\s+/g, '-');
        
        let country = await prisma.country.findUnique({
          where: { code: countryCode }
        });

        if (!country) {
          country = await prisma.country.create({
            data: {
              code: countryCode,
              name: mep.country,
              slug: countrySlug
            }
          });
          countriesCreated++;
        }

        countryId = country.id;
        countryMap.set(mep.country, countryId);
      }

      // Get or create party (if exists)
      let partyId: string | undefined = undefined;
      if (mep.party && mep.party !== 'nan') {
        const partyKey = `${mep.party}-${mep.national_party || 'none'}`;
        partyId = partyMap.get(partyKey);
        
        if (!partyId) {
          const partySlug = mep.party.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          
          let party = await prisma.party.findUnique({
            where: { slug: partySlug }
          });

          if (!party) {
            party = await prisma.party.create({
              data: {
                name: mep.national_party || mep.party,
                abbreviation: getGroupAbbreviation(mep.party),
                euGroup: mep.party,
                countryId: countryId,
                slug: partySlug
              }
            });
            partiesCreated++;
          }

          partyId = party.id;
          partyMap.set(partyKey, partyId);
        }
      }

      // Split name into first and last
      const nameParts = mep.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;

      // Create MEP
      await prisma.mEP.create({
        data: {
          epId: mep.mep_id,
          firstName: firstName,
          lastName: lastName,
          slug: mep.name.toLowerCase().replace(/\s+/g, '-'),
          photoUrl: mep.image_url || null,
          countryId: countryId,
          partyId: partyId,
          attendancePct: mep.attendance_pct ? Math.round(mep.attendance_pct * 100) : null,
          votesCast: mep.votes_cast || 0,
          votesTotal: mep.votes_total_period || 0,
          active: true
        }
      });

      imported++;

      if (imported % 50 === 0) {
        console.log(`  ✓ Imported ${imported} MEPs...`);
      }

    } catch (error) {
      console.error(`  ✗ Error importing ${mep.name}:`, error);
    }
  }

  console.log(`\n✅ MEPs imported: ${imported}, skipped: ${skipped}`);
  console.log(`✅ Countries created: ${countriesCreated}`);
  console.log(`✅ Parties created: ${partiesCreated}`);
  console.log('\n🎉 Import complete!');
}

function getCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    'Germany': 'DE', 'France': 'FR', 'Italy': 'IT', 'Spain': 'ES', 'Poland': 'PL',
    'Romania': 'RO', 'Netherlands': 'NL', 'Belgium': 'BE', 'Greece': 'GR',
    'Czech Republic': 'CZ', 'Sweden': 'SE', 'Portugal': 'PT', 'Hungary': 'HU',
    'Austria': 'AT', 'Bulgaria': 'BG', 'Denmark': 'DK', 'Finland': 'FI',
    'Slovakia': 'SK', 'Ireland': 'IE', 'Croatia': 'HR', 'Lithuania': 'LT',
    'Slovenia': 'SI', 'Latvia': 'LV', 'Estonia': 'EE', 'Cyprus': 'CY',
    'Luxembourg': 'LU', 'Malta': 'MT'
  };
  return countryMap[country] || country.substring(0, 2).toUpperCase();
}

function getGroupAbbreviation(party: string): string {
  if (!party) return '';
  
  if (party.includes('European People\'s Party') || party.includes('EPP')) return 'EPP';
  if (party.includes('Progressive Alliance of Socialists') || party.includes('S&D')) return 'S&D';
  if (party.includes('Renew Europe') || party.includes('RE')) return 'RE';
  if (party.includes('Greens/European Free Alliance') || party.includes('Greens/EFA')) return 'Greens/EFA';
  if (party.includes('European Conservatives and Reformists') || party.includes('ECR')) return 'ECR';
  if (party.includes('Identity and Democracy') || party.includes('ID')) return 'ID';
  if (party.includes('The Left') || party.includes('GUE/NGL')) return 'Left';
  if (party.includes('Patriots for Europe') || party.includes('PfE')) return 'Patriots';
  if (party.includes('Europe of Sovereign Nations') || party.includes('ESN')) return 'ESN';
  if (party.includes('Non-attached') || party.includes('NI')) return 'NI';
  
  return party;
}

main()
  .catch((error) => {
    console.error('❌ Error during import:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

