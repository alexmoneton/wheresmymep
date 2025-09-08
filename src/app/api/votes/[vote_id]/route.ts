import { NextRequest, NextResponse } from 'next/server';
import { getVote } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vote_id: string }> }
) {
  try {
    const { vote_id } = await params;
    const vote = getVote(vote_id);
    
    if (!vote) {
      return NextResponse.json(
        { error: 'not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(vote);
  } catch (error) {
    console.error('Error in /api/votes/[vote_id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
