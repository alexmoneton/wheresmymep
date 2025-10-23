#!/usr/bin/env ts-node
/**
 * Upload comprehensive voting data to Vercel Blob Storage
 * Run with: BLOB_READ_WRITE_TOKEN=xxx npx ts-node scripts/upload-comprehensive-votes.ts
 */

import { put } from '@vercel/blob';
import * as fs from 'fs';
import * as path from 'path';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

async function uploadComprehensiveData() {
  console.log('📤 Uploading comprehensive voting data to Vercel Blob...');
  
  // Path to the full dataset (from parent directory)
  const dataPath = path.join(__dirname, '../../wheres-my-mep-app/public/data');
  const fullDataPath = path.join(__dirname, '../../');
  
  // Check if we have the comprehensive data
  const comprehensiveNotableVotes = path.join(fullDataPath, 'comprehensive_notable_votes.json');
  const comprehensiveVotes = path.join(fullDataPath, 'comprehensive_votes.json');
  
  if (!fs.existsSync(comprehensiveNotableVotes)) {
    console.error('❌ Comprehensive data not found. Please run the data processing script first.');
    console.log('   Expected file:', comprehensiveNotableVotes);
    process.exit(1);
  }
  
  // Compress and upload notable votes
  console.log('🗜️  Compressing notable votes...');
  const notableVotesGz = path.join(fullDataPath, 'comprehensive_notable_votes.json.gz');
  
  await pipeline(
    fs.createReadStream(comprehensiveNotableVotes),
    createGzip({ level: 9 }),
    fs.createWriteStream(notableVotesGz)
  );
  
  const stats = fs.statSync(notableVotesGz);
  console.log(`   Compressed size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  
  // Upload to Vercel Blob
  console.log('☁️  Uploading to Vercel Blob...');
  
  const blob = await put('votes/comprehensive-notable-votes.json.gz', fs.createReadStream(notableVotesGz), {
    access: 'public',
    addRandomSuffix: false,
  });
  
  console.log('✅ Upload complete!');
  console.log('   URL:', blob.url);
  console.log('   Size:', blob.size, 'bytes');
  
  // Clean up temp file
  fs.unlinkSync(notableVotesGz);
  
  console.log('\n🎉 Comprehensive data is now available via Vercel Blob!');
  console.log('   Next: Update the Vote Explorer to fetch from this URL');
}

// Run if called directly
if (require.main === module) {
  uploadComprehensiveData().catch(console.error);
}

export { uploadComprehensiveData };

