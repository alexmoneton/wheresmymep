import { NextRequest, NextResponse } from 'next/server';
import { getNotableVotes } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notableVotes = getNotableVotes(id);
    
    return NextResponse.json(notableVotes);
  } catch (error) {
    console.error('Error in /api/meps/[id]/notable:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
