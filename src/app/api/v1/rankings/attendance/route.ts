import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { APIKeyManager } from '@/lib/api-keys';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

const prisma = new PrismaClient();

// GET /api/v1/rankings/attendance - Get attendance rankings
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
    const country = searchParams.get('country');
    const party = searchParams.get('party');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = { 
      active: true,
      attendancePct: { not: null },
    };
    
    if (country) {
      where.country = { code: country.toUpperCase() };
    }
    
    if (party) {
      where.party = { euGroup: party };
    }

    // Get MEPs with attendance data
    const [meps, total] = await Promise.all([
      prisma.mEP.findMany({
        where,
        include: {
          country: true,
          party: true,
        },
        orderBy: { attendancePct: sortOrder as 'asc' | 'desc' },
        take: Math.min(limit, 100), // Cap at 100
        skip: offset,
      }),
      prisma.mEP.count({ where }),
    ]);

    // Format response with rankings
    const formattedRankings = meps.map((mep, index) => ({
      rank: offset + index + 1,
      mep: {
        id: mep.id,
        epId: mep.epId,
        firstName: mep.firstName,
        lastName: mep.lastName,
        fullName: `${mep.firstName} ${mep.lastName}`,
        slug: mep.slug,
        country: {
          code: mep.country.code,
          name: mep.country.name,
        },
        party: mep.party ? {
          name: mep.party.name,
          abbreviation: mep.party.abbreviation,
          euGroup: mep.party.euGroup,
        } : null,
        photoUrl: mep.photoUrl,
      },
      attendance: {
        percentage: mep.attendancePct,
        votesCast: mep.votesCast,
        votesTotal: mep.votesTotal,
      },
    }));

    const response = NextResponse.json({
      data: formattedRankings,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        metric: 'attendance',
        sortOrder,
      },
    });

    // Add rate limit headers
    Object.entries(getRateLimitHeaders(rateLimitResult)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('Error fetching attendance rankings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

