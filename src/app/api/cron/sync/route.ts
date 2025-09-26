import { NextRequest, NextResponse } from 'next/server';
import { ingestData } from '../../../../ingestion';

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    const token = process.env.INGESTION_TOKEN;
    
    if (!token) {
      return NextResponse.json({ error: 'Ingestion token not configured' }, { status: 500 });
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }
    
    const providedToken = authHeader.substring(7);
    if (providedToken !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Run ingestion
    console.log('🔄 Starting ingestion via API...');
    await ingestData();
    
    // Trigger revalidation
    const revalidationResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REVALIDATION_TOKEN}`,
      },
      body: JSON.stringify({
        paths: [
          '/',
          '/meps',
          '/committees',
          '/dossiers',
          '/votes',
          '/topics',
          '/rankings',
        ],
      }),
    });
    
    if (!revalidationResponse.ok) {
      console.error('Failed to trigger revalidation:', await revalidationResponse.text());
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data ingestion completed successfully',
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error during ingestion:', error);
    return NextResponse.json(
      { error: 'Ingestion failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
