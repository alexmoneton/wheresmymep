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

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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
    const { success, limit, reset, remaining } = await ratelimit.limit(`api:${user.id}`);
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', limit, reset, remaining },
        { status: 429 }
      );
    }

    // Get MEP
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
          orderBy: {
            vote: {
              date: 'desc',
            },
          },
          take: 50,
        },
      },
    });

    if (!mep) {
      return NextResponse.json({ error: 'MEP not found' }, { status: 404 });
    }

    // Get attendance data
    const attendance = await prisma.attendance.findMany({
      where: { mepId: mep.id },
      orderBy: { date: 'desc' },
      take: 180, // Last 180 days
    });

    const totalVotes = attendance.length;
    const presentVotes = attendance.filter(a => a.present).length;
    const attendancePct = totalVotes > 0 ? Math.round((presentVotes / totalVotes) * 100) : 0;

    // Format response
    const formattedMep = {
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
      attendance: {
        percentage: attendancePct,
        votesCast: presentVotes,
        totalVotes: totalVotes,
      },
      recentVotes: mep.votes.map(mv => ({
        id: mv.vote.id,
        title: mv.vote.title,
        date: mv.vote.date,
        choice: mv.choice,
        dossier: mv.vote.dossier ? {
          title: mv.vote.dossier.title,
          code: mv.vote.dossier.code,
        } : null,
      })),
      twitter: mep.twitter,
      website: mep.website,
      email: mep.email,
    };

    return NextResponse.json({
      data: formattedMep,
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
