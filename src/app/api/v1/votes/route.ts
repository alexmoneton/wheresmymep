import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { APIKeyManager } from '@/lib/api-keys';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

const prisma = new PrismaClient();

// GET /api/v1/votes - Get votes with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Get API key from headers
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required. Include x-api-key header.' },
        { status: 401 }
      );
    }

    // Validate API key
    const keyValidation = await APIKeyManager.validateAPIKey(apiKey);
    if (!keyValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Check rate limit
    const userTier = keyValidation.user?.subscriptions?.length > 0 ? 'pro' : 'free';
    const rateLimitResult = await checkRateLimit(apiKey, userTier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    // Update last used timestamp
    await APIKeyManager.updateLastUsed(apiKey);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const dossierId = searchParams.get('dossierId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};
    
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }
    
    if (dossierId) {
      where.dossierId = dossierId;
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get votes
    const [votes, total] = await Promise.all([
      prisma.vote.findMany({
        where,
        include: {
          dossier: true,
          mepVotes: {
            include: {
              mep: {
                include: {
                  country: true,
                  party: true,
                },
              },
            },
          },
        },
        orderBy,
        take: Math.min(limit, 100), // Cap at 100
        skip: offset,
      }),
      prisma.vote.count({ where }),
    ]);

    // Format response
    const formattedVotes = votes.map(vote => ({
      id: vote.id,
      epVoteId: vote.epVoteId,
      title: vote.title,
      description: vote.description,
      date: vote.date.toISOString(),
      dossier: vote.dossier ? {
        id: vote.dossier.id,
        code: vote.dossier.code,
        title: vote.dossier.title,
        slug: vote.dossier.slug,
        summary: vote.dossier.summary,
        policyAreas: vote.dossier.policyAreas,
      } : null,
      results: {
        total: vote.mepVotes.length,
        for: vote.mepVotes.filter(mv => mv.choice === 'for').length,
        against: vote.mepVotes.filter(mv => mv.choice === 'against').length,
        abstain: vote.mepVotes.filter(mv => mv.choice === 'abstain').length,
        absent: vote.mepVotes.filter(mv => mv.choice === 'absent').length,
      },
      mepVotes: vote.mepVotes.map(mepVote => ({
        mep: {
          id: mepVote.mep.id,
          firstName: mepVote.mep.firstName,
          lastName: mepVote.mep.lastName,
          fullName: `${mepVote.mep.firstName} ${mepVote.mep.lastName}`,
          country: {
            code: mepVote.mep.country.code,
            name: mepVote.mep.country.name,
          },
          party: mepVote.mep.party ? {
            name: mepVote.mep.party.name,
            abbreviation: mepVote.mep.party.abbreviation,
            euGroup: mepVote.mep.party.euGroup,
          } : null,
        },
        choice: mepVote.choice,
      })),
    }));

    const response = NextResponse.json({
      data: formattedVotes,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    });

    // Add rate limit headers
    Object.entries(getRateLimitHeaders(rateLimitResult)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

