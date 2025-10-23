import { NextRequest, NextResponse } from 'next/server';
import { gunzipSync } from 'zlib';

// Cache the decompressed data for 5 minutes
let cachedData: any = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mep_id = searchParams.get('mep_id');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    
    // Check cache
    const now = Date.now();
    if (cachedData && (now - cacheTime) < CACHE_DURATION) {
      console.log('Using cached comprehensive data');
    } else {
      console.log('Fetching fresh comprehensive data from Vercel Blob...');
      
      // Fetch compressed data from Vercel Blob
      const blobUrl = 'https://9vpah3p1levlj5t9.public.blob.vercel-storage.com/votes/comprehensive-notable-votes.json.gz';
      const response = await fetch(blobUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from Blob: ${response.status}`);
      }
      
      // Get compressed data
      const compressedBuffer = await response.arrayBuffer();
      
      // Decompress
      const decompressed = gunzipSync(Buffer.from(compressedBuffer));
      cachedData = JSON.parse(decompressed.toString('utf-8'));
      cacheTime = now;
      
      console.log(`Decompressed data for ${Object.keys(cachedData).length} MEPs`);
    }
    
    // Filter data based on query parameters
    let filteredData = cachedData;
    
    // Filter by MEP ID
    if (mep_id) {
      filteredData = { [mep_id]: cachedData[mep_id] || [] };
    }
    
    // Filter by date range
    if (date_from || date_to) {
      const filtered: any = {};
      
      for (const [mepId, votes] of Object.entries(filteredData)) {
        const filteredVotes = (votes as any[]).filter((vote: any) => {
          const voteDate = new Date(vote.vote_date);
          
          if (date_from) {
            const fromDate = new Date(date_from);
            if (voteDate < fromDate) return false;
          }
          
          if (date_to) {
            const toDate = new Date(date_to);
            if (voteDate > toDate) return false;
          }
          
          return true;
        });
        
        if (filteredVotes.length > 0) {
          filtered[mepId] = filteredVotes;
        }
      }
      
      filteredData = filtered;
    }
    
    // Calculate statistics
    const totalVotes = Object.values(filteredData).reduce(
      (sum: number, votes: any) => sum + votes.length,
      0
    );
    
    return NextResponse.json({
      success: true,
      data: filteredData,
      stats: {
        meps: Object.keys(filteredData).length,
        total_votes: totalVotes,
        cached: (now - cacheTime) < CACHE_DURATION
      }
    });
    
  } catch (error) {
    console.error('Error in /api/votes/comprehensive:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch comprehensive data'
      },
      { status: 500 }
    );
  }
}

