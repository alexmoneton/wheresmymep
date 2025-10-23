import { NextRequest, NextResponse } from 'next/server';
import { gunzipSync } from 'zlib';

// Cache the decompressed data for 5 minutes
let cachedData: any = null;
let cachedVotesCatalog: any = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper functions (same as search route)
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
  return countryMap[country] || country;
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

function getLeadershipRole(name: string): { leadership_role: boolean; role_note?: string } {
  const vicePresidents = [
    'Sabine Verheyen', 'Ewa Kopacz', 'Esteban González Pons', 'Katarina Barley',
    'Pina Picierno', 'Victor Negrescu', 'Martin Hojsík', 'Christel Schaldemose',
    'Javi López Fernández', 'Sophie Wilmès', 'Nicolae Ştefănuţă', 'Roberts Zīle',
    'Antonella Sberna', 'Younous Omarjee'
  ];
  
  if (vicePresidents.includes(name)) {
    return { leadership_role: true, role_note: 'Vice-President' };
  }
  
  return { leadership_role: false };
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Comprehensive data API called');
    
    // Check cache
    const now = Date.now();
    if (!cachedData || !cachedVotesCatalog || (now - cacheTime) > CACHE_DURATION) {
      console.log('🔄 Fetching fresh comprehensive data from Vercel Blob...');
      
      // Fetch compressed notable votes from Vercel Blob
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
      
      // Also fetch votes catalog
      const catalogUrl = 'https://9vpah3p1levlj5t9.public.blob.vercel-storage.com/votes/comprehensive-votes.json';
      const catalogResponse = await fetch(catalogUrl);
      cachedVotesCatalog = await catalogResponse.json();
      
      cacheTime = now;
      
      console.log(`✅ Decompressed data for ${Object.keys(cachedData).length} MEPs, ${cachedVotesCatalog.length} votes`);
    } else {
      console.log('⚡ Using cached comprehensive data');
    }
    
    // Return the raw data - let the search endpoint process it
    return NextResponse.json({
      success: true,
      notableVotes: cachedData,
      votesCatalog: cachedVotesCatalog,
      stats: {
        meps: Object.keys(cachedData).length,
        votes: cachedVotesCatalog.length,
        cached: (now - cacheTime) < CACHE_DURATION
      }
    });
    
  } catch (error) {
    console.error('❌ Error in /api/votes/comprehensive:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch comprehensive data'
      },
      { status: 500 }
    );
  }
}
