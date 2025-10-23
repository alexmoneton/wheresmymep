import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Choice } from '@prisma/client';

const prisma = new PrismaClient();

interface VoteSearchParams {
  q?: string;
  dossier_id?: string;
  date_from?: string;
  date_to?: string;
  group?: string;
  country?: string;
  party?: string;
  mep_id?: string;
  outcome?: string;
  page?: number;
  page_size?: number;
}

interface VoteResult {
  vote_id: string;
  dossier_id: string;
  dossier_title: string;
  date: string;
  mep_id: string;
  mep_name: string;
  group: string;
  country: string;
  party: string;
  outcome: string;
  majority_outcome: string;
  ep_source_url: string;
  leadership_role: boolean;
  role_note?: string;
}

// Helper functions
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

function mapChoiceToString(choice: Choice): string {
  switch (choice) {
    case Choice.for: return 'For';
    case Choice.against: return 'Against';
    case Choice.abstain: return 'Abstain';
    case Choice.absent: return 'Absent';
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params: VoteSearchParams = {
      q: searchParams.get('q') || undefined,
      dossier_id: searchParams.get('dossier_id') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      group: searchParams.get('group') || undefined,
      country: searchParams.get('country') || undefined,
      party: searchParams.get('party') || undefined,
      mep_id: searchParams.get('mep_id') || undefined,
      outcome: searchParams.get('outcome') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      page_size: Math.min(parseInt(searchParams.get('page_size') || '20'), 200),
    };

    console.log('🔍 Database search with params:', params);

    // Build Prisma where clause
    const where: any = {};

    // Date filters
    if (params.date_from || params.date_to) {
      where.vote = where.vote || {};
      where.vote.date = {};
      if (params.date_from) {
        where.vote.date.gte = new Date(params.date_from);
      }
      if (params.date_to) {
        where.vote.date.lte = new Date(params.date_to);
      }
    }

    // Vote title search
    if (params.q) {
      where.vote = where.vote || {};
      where.vote.title = {
        contains: params.q,
        mode: 'insensitive'
      };
    }

    // Vote ID filter
    if (params.dossier_id) {
      where.vote = where.vote || {};
      where.vote.epVoteId = params.dossier_id;
    }

    // MEP filters
    if (params.mep_id) {
      where.mep = where.mep || {};
      where.mep.epId = params.mep_id;
    }

    if (params.country) {
      where.mep = where.mep || {};
      where.mep.country = {
        code: params.country
      };
    }

    // Outcome filter
    if (params.outcome) {
      const choiceMap: Record<string, Choice> = {
        'For': Choice.for,
        'Against': Choice.against,
        'Abstain': Choice.abstain,
        'Absent': Choice.absent
      };
      where.choice = choiceMap[params.outcome];
    }

    // Get total count
    const total = await prisma.mEPVote.count({ where });

    // Get paginated results
    const skip = (params.page - 1) * params.page_size;
    const mepVotes = await prisma.mEPVote.findMany({
      where,
      include: {
        mep: {
          include: {
            country: true,
            party: true
          }
        },
        vote: true
      },
      orderBy: {
        vote: {
          date: 'desc'
        }
      },
      skip,
      take: params.page_size
    });

    console.log(`✅ Found ${total} total votes, returning ${mepVotes.length}`);

    // Transform to API format
    const results: VoteResult[] = mepVotes.map(mepVote => {
      const mepName = `${mepVote.mep.firstName} ${mepVote.mep.lastName}`;
      const leadership = getLeadershipRole(mepName);
      
      return {
        vote_id: mepVote.vote.epVoteId,
        dossier_id: mepVote.vote.epVoteId,
        dossier_title: mepVote.vote.title || 'Untitled Vote',
        date: mepVote.vote.date.toISOString().split('T')[0],
        mep_id: mepVote.mep.epId,
        mep_name: mepName,
        group: getGroupAbbreviation(mepVote.mep.party?.euGroup || ''),
        country: mepVote.mep.country.code,
        party: mepVote.mep.party?.name || '',
        outcome: mapChoiceToString(mepVote.choice),
        majority_outcome: 'for', // TODO: Calculate from vote totals
        ep_source_url: 'https://www.europarl.europa.eu/plenary/en/votes.html',
        leadership_role: leadership.leadership_role,
        role_note: leadership.role_note
      };
    });

    // Check if too large
    const tooLarge = total > 50000;

    // Create export URL
    const exportParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        exportParams.set(key, value.toString());
      }
    });

    const response: any = {
      items: results,
      page: params.page,
      page_size: params.page_size,
      total,
      export_url: `/api/votes/export.csv?${exportParams.toString()}`
    };

    if (tooLarge) {
      response.too_large = true;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in /api/votes/search-db:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    );
  }
}

