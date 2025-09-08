import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboardTop, getLeaderboardBottom } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '25');
    
    const top = getLeaderboardTop(limit);
    const bottom = getLeaderboardBottom(limit);
    
    return NextResponse.json({
      top: top.map(mep => ({
        id: mep.mep_id,
        name: mep.name,
        country: mep.country,
        party: mep.party,
        attendance_pct: mep.attendance_pct,
        votes_cast: mep.votes_cast,
        votes_total_period: mep.votes_total_period,
      })),
      bottom: bottom.map(mep => ({
        id: mep.mep_id,
        name: mep.name,
        country: mep.country,
        party: mep.party,
        attendance_pct: mep.attendance_pct,
        votes_cast: mep.votes_cast,
        votes_total_period: mep.votes_total_period,
      })),
    });
  } catch (error) {
    console.error('Error in /api/leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
