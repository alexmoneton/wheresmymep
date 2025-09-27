import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { APIKeyManager } from '@/lib/api-keys';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

const prisma = new PrismaClient();

// GET /api/v1/meps - Get all MEPs with optional filtering
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
    const committee = searchParams.get('committee');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'lastName';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build where clause
    const where: any = { active: true };
    
    if (country) {
      where.country = { code: country.toUpperCase() };
    }
    
    if (party) {
      where.party = { euGroup: party };
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'attendance') {
      orderBy.attendancePct = sortOrder;
    } else if (sortBy === 'votes') {
      orderBy.votesCast = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Get MEPs
    const [meps, total] = await Promise.all([
      prisma.mEP.findMany({
        where,
        include: {
          country: true,
          party: true,
          memberships: {
            include: {
              committee: true,
            },
          },
        },
        orderBy,
        take: Math.min(limit, 100), // Cap at 100
        skip: offset,
      }),
      prisma.mEP.count({ where }),
    ]);

    // Filter by committee if specified
    let filteredMeps = meps;
    if (committee) {
      filteredMeps = meps.filter(mep => 
        mep.memberships.some(membership => 
          membership.committee.code === committee.toUpperCase()
        )
      );
    }

    // Format response
    const formattedMeps = filteredMeps.map(mep => ({
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
      committees: mep.memberships.map(membership => ({
        code: membership.committee.code,
        name: membership.committee.name,
        role: membership.role,
      })),
      attendance: {
        percentage: mep.attendancePct,
        votesCast: mep.votesCast,
        votesTotal: mep.votesTotal,
      },
      photoUrl: mep.photoUrl,
      twitter: mep.twitter,
      website: mep.website,
      email: mep.email,
      active: mep.active,
    }));

    const response = NextResponse.json({
      data: formattedMeps,
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
    console.error('Error fetching MEPs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}