#!/usr/bin/env ts-node
/**
 * Upload comprehensive voting data to Vercel Blob Storage
 * Run with: npx tsx scripts/upload-comprehensive-votes.ts
 */

import { put } from '@vercel/blob';
import * as fs from 'fs';
import * as path from 'path';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

async function uploadComprehensiveData() {
  console.log('📤 Uploading comprehensive voting data to Vercel Blob...\n');
  
  // Check for token
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN environment variable is not set!');
    console.log('\n📝 To fix this:');
    console.log('   1. Go to https://vercel.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Go to Storage → Create Blob Store');
    console.log('   4. Copy the BLOB_READ_WRITE_TOKEN');
    console.log('   5. Add to .env.local:');
    console.log('      echo "BLOB_READ_WRITE_TOKEN=your_token" >> .env.local');
    console.log('\nSee VERCEL_BLOB_SETUP.md for detailed instructions.');
    process.exit(1);
  }
  
  // Path to the full dataset (from parent directory)
  const fullDataPath = path.join(__dirname, '../../');
  
  // Check if we have the comprehensive data (compressed version)
  const comprehensiveNotableVotesGz = path.join(fullDataPath, 'comprehensive_notable_votes.json.gz');
  
  if (!fs.existsSync(comprehensiveNotableVotesGz)) {
    console.error('❌ Comprehensive data not found!');
    console.log('   Expected file:', comprehensiveNotableVotesGz);
    console.log('\n📝 To generate the data:');
    console.log('   cd /Users/alexandre/wheres-my-mep');
    console.log('   python3 save_comprehensive_data.py');
    process.exit(1);
  }
  
  // Use the already compressed file
  const stats = fs.statSync(comprehensiveNotableVotesGz);
  console.log(`📦 Found compressed data: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  
  // Upload to Vercel Blob
  console.log('☁️  Uploading to Vercel Blob...');
  console.log('   This may take a minute...\n');
  
  const blob = await put('votes/comprehensive-notable-votes.json.gz', fs.createReadStream(comprehensiveNotableVotesGz), {
    access: 'public',
    addRandomSuffix: false,
  });
  
  console.log('✅ Upload complete!');
  console.log('   URL:', blob.url);
  console.log('   Size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
  
  // Also upload the votes catalog
  const comprehensiveVotes = path.join(fullDataPath, 'comprehensive_votes.json');
  if (fs.existsSync(comprehensiveVotes)) {
    console.log('\n📤 Uploading votes catalog...');
    const votesBlob = await put('votes/comprehensive-votes.json', fs.createReadStream(comprehensiveVotes), {
      access: 'public',
      addRandomSuffix: false,
    });
    console.log('✅ Votes catalog uploaded!');
    console.log('   URL:', votesBlob.url);
  }
  
  console.log('\n🎉 Comprehensive data is now available via Vercel Blob!');
  console.log('\n📝 Next steps:');
  console.log('   1. Note the URL above');
  console.log('   2. Create API endpoint to serve this data');
  console.log('   3. Update Vote Explorer to fetch from the API');
  console.log('\nSee COMPREHENSIVE_DATA_SOLUTION.md for implementation details.');
}

// Run if called directly
if (require.main === module) {
  uploadComprehensiveData().catch(console.error);
}

export { uploadComprehensiveData };

