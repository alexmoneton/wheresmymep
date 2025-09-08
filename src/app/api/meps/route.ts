import { NextRequest, NextResponse } from 'next/server';
import { searchMEPs } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const group = searchParams.get('group') || undefined;
    const country = searchParams.get('country') || undefined;
    
    const results = searchMEPs(query, group, country);
    
    // Return minimal data for list view
    const meps = results.map(mep => ({
      id: mep.mep_id,
      name: mep.name,
      country: mep.country,
      party: mep.party,
      national_party: mep.national_party,
      attendance_pct: mep.attendance_pct,
    }));
    
    return NextResponse.json(meps);
  } catch (error) {
    console.error('Error in /api/meps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
