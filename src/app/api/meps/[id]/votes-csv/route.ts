import { NextRequest, NextResponse } from 'next/server';
import { getMEP, getNotableVotes } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mep = getMEP(id);
    
    if (!mep) {
      return NextResponse.json(
        { error: 'MEP not found' },
        { status: 404 }
      );
    }

    // Get notable votes for the MEP
    const notableVotes = getNotableVotes(id);
    
    // Filter votes to last 6 months (180 days)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
    
    const recentVotes = notableVotes.filter(vote => {
      const voteDate = new Date(vote.vote_date);
      return voteDate >= sixMonthsAgo;
    });

    // Generate CSV content
    const csvHeaders = [
      'MEP Name',
      'MEP ID', 
      'Country',
      'Party',
      'Vote Date',
      'Vote Title',
      'Vote Position',
      'Result',
      'Total For',
      'Total Against', 
      'Total Abstain',
      'Source URL'
    ];

    const csvRows = recentVotes.map(vote => [
      mep.name,
      mep.mep_id || '',
      mep.country,
      mep.party,
      vote.vote_date,
      `"${vote.title.replace(/"/g, '""')}"`, // Escape quotes in title
      vote.vote_position,
      vote.result || '',
      vote.total_for || '',
      vote.total_against || '',
      vote.total_abstain || '',
      vote.source_url
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Return CSV response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="mep-${mep.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-votes-6months.csv"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error generating MEP votes CSV:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
