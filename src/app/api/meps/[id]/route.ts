import { NextRequest, NextResponse } from 'next/server';
import { getMEP } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mep = getMEP(id);
    
    if (!mep) {
      return NextResponse.json(
        { error: 'not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(mep);
  } catch (error) {
    console.error('Error in /api/meps/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
