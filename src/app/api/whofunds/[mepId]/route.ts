import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { WhoFundsData, validateWhoFundsData } from '@/lib/zod/whofunds';
import { ENV_DEFAULTS } from '@/lib/flags';

interface RouteParams {
  params: Promise<{ mepId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // Feature flag guard
  if (!ENV_DEFAULTS.whofunds) {
    return NextResponse.json(
      { error: 'Feature not available' },
      { status: 404 }
    );
  }

  try {
    const { mepId } = await params;
    
    // Validate MEP ID format
    if (!/^\d+$/.test(mepId)) {
      return NextResponse.json(
        { error: 'Invalid MEP ID format' },
        { status: 400 }
      );
    }
    
    // Read the MEP data file
    const dataPath = path.join(process.cwd(), 'public/data/whofunds', `${mepId}.json`);
    
    try {
      const fileContent = await fs.readFile(dataPath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      // Validate the data structure
      const validatedData = validateWhoFundsData(data);
      
      // Set cache headers
      const headers = new Headers();
      headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
      headers.set('Content-Type', 'application/json');
      
      return new NextResponse(JSON.stringify(validatedData), {
        status: 200,
        headers
      });
      
    } catch (fileError) {
      // File doesn't exist or is invalid
      return NextResponse.json(
        { error: 'MEP data not found' },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Error fetching MEP data:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
