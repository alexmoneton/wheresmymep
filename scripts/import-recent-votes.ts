/**
 * Import recent voting data into Postgres database
 * 
 * This script imports the recent votes (last few months) from local JSON files
 * 
 * Run with: npx tsx scripts/import-recent-votes.ts
 */

import { PrismaClient, Choice } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Map vote positions to Prisma Choice enum
function mapVoteChoice(position: string): Choice {
  const normalized = position.toLowerCase();
  if (normalized === 'for') return Choice.for;
  if (normalized === 'against') return Choice.against;
  if (normalized === 'abstain') return Choice.abstain;
  return Choice.absent;
}

async function main() {
  console.log('🚀 Starting recent vote data import...\n');

  // Load recent data from public/data
  console.log('📂 Loading recent data files...');
  const notableVotesPath = path.join(__dirname, '..', 'public', 'data', 'notable-votes.json');
  const votesCatalogPath = path.join(__dirname, '..', 'public', 'data', 'votes.json');

  const notableVotes = JSON.parse(fs.readFileSync(notableVotesPath, 'utf-8'));
  const votesCatalog = JSON.parse(fs.readFileSync(votesCatalogPath, 'utf-8'));

  console.log(`✅ Loaded data for ${Object.keys(notableVotes).length} MEPs`);
  console.log(`✅ Loaded ${votesCatalog.length} votes in catalog\n`);

  // Load MEPs from JSON to map mep_id to database ID
  const mepsJsonPath = path.join(__dirname, '..', 'public', 'data', 'meps.json');
  const mepsJson = JSON.parse(fs.readFileSync(mepsJsonPath, 'utf-8'));
  
  console.log('🔍 Building MEP ID mapping...');
  const mepIdMap = new Map<string, string>(); // mep_id -> database ID
  
  for (const mep of mepsJson) {
    if (mep.mep_id) {
      // Find MEP in database by epId
      const dbMep = await prisma.mEP.findUnique({
        where: { epId: mep.mep_id }
      });
      
      if (dbMep) {
        mepIdMap.set(mep.mep_id, dbMep.id);
      }
    }
  }
  
  console.log(`✅ Mapped ${mepIdMap.size} MEPs\n`);

  // Import votes
  console.log('📥 Importing votes into database...');
  let votesImported = 0;
  let votesSkipped = 0;
  let mepVotesImported = 0;

  // Create a map of vote_id to database vote ID
  const voteIdMap = new Map<string, string>();

  // First, import all unique votes from the catalog
  console.log(`📊 Importing ${votesCatalog.length} votes from catalog`);

  for (let i = 0; i < votesCatalog.length; i++) {
    const voteData = votesCatalog[i];
    
    try {
      // Check if vote already exists
      const existing = await prisma.vote.findUnique({
        where: { epVoteId: voteData.vote_id }
      });

      if (existing) {
        voteIdMap.set(voteData.vote_id, existing.id);
        votesSkipped++;
        continue;
      }

      // Create new vote
      const vote = await prisma.vote.create({
        data: {
          epVoteId: voteData.vote_id,
          date: new Date(voteData.vote_date),
          title: voteData.title,
          description: voteData.result
        }
      });

      voteIdMap.set(voteData.vote_id, vote.id);
      votesImported++;

      if (votesImported % 100 === 0) {
        console.log(`  ✓ Imported ${votesImported} votes...`);
      }
    } catch (error) {
      console.error(`  ✗ Error importing vote ${voteData.vote_id}:`, error);
    }
  }

  console.log(`✅ Votes imported: ${votesImported}, skipped: ${votesSkipped}\n`);

  // Now import MEP votes
  console.log('📥 Importing individual MEP votes...');

  for (const mepId in notableVotes) {
    const dbMepId = mepIdMap.get(mepId);
    if (!dbMepId) {
      continue; // Skip if MEP not in database
    }

    const votes = notableVotes[mepId];
    
    for (const vote of votes) {
      const dbVoteId = voteIdMap.get(vote.vote_id);
      if (!dbVoteId) {
        continue; // Skip if vote wasn't imported
      }

      try {
        // Check if MEPVote already exists
        const existing = await prisma.mEPVote.findUnique({
          where: {
            mepId_voteId: {
              mepId: dbMepId,
              voteId: dbVoteId
            }
          }
        });

        if (existing) {
          continue; // Skip if already exists
        }

        // Create MEPVote
        await prisma.mEPVote.create({
          data: {
            mepId: dbMepId,
            voteId: dbVoteId,
            choice: mapVoteChoice(vote.vote_position)
          }
        });

        mepVotesImported++;

        if (mepVotesImported % 1000 === 0) {
          console.log(`  ✓ Imported ${mepVotesImported} MEP votes...`);
        }
      } catch (error) {
        // Silently skip duplicates
      }
    }
  }

  console.log(`✅ MEP votes imported: ${mepVotesImported}\n`);

  console.log('🎉 Import complete!');
  console.log(`   Total votes: ${votesImported + votesSkipped}`);
  console.log(`   Total MEP votes: ${mepVotesImported}`);
}

main()
  .catch((error) => {
    console.error('❌ Error during import:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

