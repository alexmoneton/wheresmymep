import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const prisma = new PrismaClient();

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
});

export async function GET(request: NextRequest) {
  try {
    // Check API key
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    // Verify API key
    const user = await prisma.user.findUnique({
      where: { apiKey },
      include: { subscriptions: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Check rate limit
    const { success, limit: rateLimit, reset, remaining } = await ratelimit.limit(`api:${user.id}`);
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', limit: rateLimit, reset, remaining },
        { status: 429 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const party = searchParams.get('party');
    const committee = searchParams.get('committee');
    const topic = searchParams.get('topic');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    const where: any = {
      active: true,
    };

    if (country) {
      where.country = { slug: country };
    }

    if (party) {
      where.party = { slug: party };
    }

    if (committee) {
      where.memberships = {
        some: {
          committee: { slug: committee },
        },
      };
    }

    // Get MEPs
    const meps = await prisma.mEP.findMany({
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
      take: Math.min(limit, 100), // Max 100 per request
      skip: offset,
      orderBy: {
        lastName: 'asc',
      },
    });

    // Get total count
    const total = await prisma.mEP.count({ where });

    // Format response
    const formattedMeps = meps.map(mep => ({
      id: mep.id,
      epId: mep.epId,
      firstName: mep.firstName,
      lastName: mep.lastName,
      slug: mep.slug,
      photoUrl: mep.photoUrl,
      country: {
        name: mep.country.name,
        code: mep.country.code,
        slug: mep.country.slug,
      },
      party: mep.party ? {
        name: mep.party.name,
        abbreviation: mep.party.abbreviation,
        slug: mep.party.slug,
      } : null,
      committees: mep.memberships.map(m => ({
        name: m.committee.name,
        code: m.committee.code,
        role: m.role,
      })),
      twitter: mep.twitter,
      website: mep.website,
      email: mep.email,
    }));

    return NextResponse.json({
      data: formattedMeps,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      rateLimit: {
        limit,
        remaining,
        reset,
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
