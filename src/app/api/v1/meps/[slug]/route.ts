import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { APIKeyManager } from '@/lib/api-keys';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

const prisma = new PrismaClient();

// GET /api/v1/meps/[slug] - Get specific MEP by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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

    // Get MEP by slug
    const mep = await prisma.mEP.findUnique({
      where: { slug: params.slug },
      include: {
        country: true,
        party: true,
        memberships: {
          include: {
            committee: true,
          },
        },
        votes: {
          include: {
            vote: {
              include: {
                dossier: true,
              },
            },
          },
          orderBy: { vote: { date: 'desc' } },
          take: 20, // Limit recent votes
        },
      },
    });

    if (!mep) {
      return NextResponse.json(
        { error: 'MEP not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedMep = {
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
      recentVotes: mep.votes.map(mepVote => ({
        id: mepVote.vote.id,
        title: mepVote.vote.title,
        date: mepVote.vote.date.toISOString(),
        choice: mepVote.choice,
        dossier: mepVote.vote.dossier ? {
          code: mepVote.vote.dossier.code,
          title: mepVote.vote.dossier.title,
          slug: mepVote.vote.dossier.slug,
        } : null,
      })),
      photoUrl: mep.photoUrl,
      twitter: mep.twitter,
      website: mep.website,
      email: mep.email,
      active: mep.active,
    };

    const response = NextResponse.json({
      data: formattedMep,
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
    console.error('Error fetching MEP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}