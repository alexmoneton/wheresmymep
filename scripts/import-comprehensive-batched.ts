/**
 * Import comprehensive voting data into Postgres database in batches
 * 
 * This script processes the large decompressed JSON file in memory-efficient batches
 * 
 * Run with: npx tsx scripts/import-comprehensive-batched.ts
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
  console.log('🚀 Starting comprehensive vote data import (batched)...\n');
  console.log('⏱️  This will take 30-60 minutes. Please be patient.\n');

  const dataPath = path.join(__dirname, '..', '..', 'comprehensive_notable_votes_full.json');

  if (!fs.existsSync(dataPath)) {
    console.log('❌ Decompressed file not found. Creating it now...');
    console.log('   This will take a few minutes...\n');
    
    const { execSync } = require('child_process');
    const gzPath = path.join(__dirname, '..', '..', 'comprehensive_notable_votes.json.gz');
    execSync(`gunzip -c "${gzPath}" > "${dataPath}"`, { stdio: 'inherit' });
    
    console.log('✅ File decompressed\n');
  }

  console.log('📂 Loading comprehensive data file...');
  console.log('   (This may take 1-2 minutes...)\n');

  // Read file in chunks to avoid memory issues
  const fileContent = fs.readFileSync(dataPath, 'utf-8');
  console.log(`✅ File loaded (${Math.round(fileContent.length / 1024 / 1024)}MB)\n`);

  console.log('🔍 Parsing JSON...');
  const notableVotes = JSON.parse(fileContent);
  console.log(`✅ Parsed data for ${Object.keys(notableVotes).length} MEPs\n`);

  // Build MEP ID map
  console.log('🔍 Building MEP ID mapping...');
  const mepsJsonPath = path.join(__dirname, '..', 'public', 'data', 'meps.json');
  const mepsJson = JSON.parse(fs.readFileSync(mepsJsonPath, 'utf-8'));
  
  const mepIdMap = new Map<string, string>();
  for (const mep of mepsJson) {
    if (mep.mep_id) {
      const dbMep = await prisma.mEP.findUnique({
        where: { epId: mep.mep_id }
      });
      if (dbMep) {
        mepIdMap.set(mep.mep_id, dbMep.id);
      }
    }
  }
  console.log(`✅ Mapped ${mepIdMap.size} MEPs\n`);

  // Create vote ID map
  const voteIdMap = new Map<string, string>();

  // Collect all unique votes first
  console.log('📊 Collecting unique votes...');
  const uniqueVotes = new Map<string, any>();
  
  for (const mepId in notableVotes) {
    const votes = notableVotes[mepId];
    for (const vote of votes) {
      if (!uniqueVotes.has(vote.vote_id)) {
        uniqueVotes.set(vote.vote_id, vote);
      }
    }
  }
  
  console.log(`✅ Found ${uniqueVotes.size} unique votes\n`);

  // Import votes in batches
  console.log('📥 Importing votes into database...');
  console.log('   Progress will be shown every 100 votes\n');
  
  let votesImported = 0;
  let votesSkipped = 0;
  const voteEntries = Array.from(uniqueVotes.entries());
  const voteBatchSize = 50; // Process 50 votes at a time
  
  for (let i = 0; i < voteEntries.length; i += voteBatchSize) {
    const batch = voteEntries.slice(i, i + voteBatchSize);
    
    for (const [voteId, voteData] of batch) {
      try {
        // Check if vote already exists
        const existing = await prisma.vote.findUnique({
          where: { epVoteId: voteId }
        });

        if (existing) {
          voteIdMap.set(voteId, existing.id);
          votesSkipped++;
        } else {
          // Create new vote
          const vote = await prisma.vote.create({
            data: {
              epVoteId: voteId,
              date: new Date(voteData.vote_date),
              title: voteData.title,
              description: voteData.result
            }
          });

          voteIdMap.set(voteId, vote.id);
          votesImported++;
        }

        if ((votesImported + votesSkipped) % 100 === 0) {
          const progress = Math.round(((votesImported + votesSkipped) / uniqueVotes.size) * 100);
          console.log(`  ✓ Progress: ${votesImported + votesSkipped}/${uniqueVotes.size} (${progress}%) - Imported: ${votesImported}, Skipped: ${votesSkipped}`);
        }
      } catch (error) {
        console.error(`  ✗ Error importing vote ${voteId}:`, error);
      }
    }
  }

  console.log(`\n✅ Votes: imported ${votesImported}, skipped ${votesSkipped}\n`);

  // Now import MEP votes in batches
  console.log('📥 Importing individual MEP votes...');
  console.log('   This is the longest part - progress shown every 1000 votes\n');

  let mepVotesImported = 0;
  let mepVotesSkipped = 0;
  let totalMepVotes = 0;

  // Count total first
  for (const mepId in notableVotes) {
    totalMepVotes += notableVotes[mepId].length;
  }
  console.log(`   Total MEP votes to process: ${totalMepVotes.toLocaleString()}\n`);

  const mepBatchSize = 10; // Process 10 MEPs at a time
  const mepIds = Object.keys(notableVotes);
  
  for (let i = 0; i < mepIds.length; i += mepBatchSize) {
    const batchMepIds = mepIds.slice(i, i + mepBatchSize);
    
    for (const mepId of batchMepIds) {
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
            mepVotesSkipped++;
          } else {
            // Create MEPVote
            await prisma.mEPVote.create({
              data: {
                mepId: dbMepId,
                voteId: dbVoteId,
                choice: mapVoteChoice(vote.vote_position)
              }
            });
            mepVotesImported++;
          }

          if ((mepVotesImported + mepVotesSkipped) % 1000 === 0) {
            const progress = Math.round(((mepVotesImported + mepVotesSkipped) / totalMepVotes) * 100);
            const elapsed = process.uptime();
            const rate = (mepVotesImported + mepVotesSkipped) / elapsed;
            const remaining = (totalMepVotes - (mepVotesImported + mepVotesSkipped)) / rate;
            
            console.log(`  ✓ Progress: ${(mepVotesImported + mepVotesSkipped).toLocaleString()}/${totalMepVotes.toLocaleString()} (${progress}%) - ETA: ${Math.round(remaining / 60)} min`);
          }
        } catch (error) {
          // Silently skip duplicates and errors
          mepVotesSkipped++;
        }
      }
    }
  }

  console.log(`\n✅ MEP votes: imported ${mepVotesImported.toLocaleString()}, skipped ${mepVotesSkipped.toLocaleString()}\n`);

  console.log('🎉 Import complete!\n');
  console.log('📊 Final statistics:');
  console.log(`   Total votes in database: ${(votesImported + votesSkipped).toLocaleString()}`);
  console.log(`   Total MEP votes in database: ${(mepVotesImported + mepVotesSkipped).toLocaleString()}`);
  console.log(`   New votes imported: ${votesImported.toLocaleString()}`);
  console.log(`   New MEP votes imported: ${mepVotesImported.toLocaleString()}\n`);

  // Verify date range
  const oldestVote = await prisma.vote.findFirst({
    orderBy: { date: 'asc' }
  });
  const newestVote = await prisma.vote.findFirst({
    orderBy: { date: 'desc' }
  });

  if (oldestVote && newestVote) {
    console.log('📅 Date range in database:');
    console.log(`   Oldest vote: ${oldestVote.date.toISOString().split('T')[0]}`);
    console.log(`   Newest vote: ${newestVote.date.toISOString().split('T')[0]}\n`);
  }

  console.log('✅ Vote Explorer now has access to all historical data!');
}

main()
  .catch((error) => {
    console.error('❌ Error during import:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

