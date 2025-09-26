import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import HomePageClient from './HomePageClient';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Where\'s My MEP? - European Parliament Attendance Tracker',
    description: 'Track attendance rates and voting records of Members of the European Parliament. Monitor MEP performance, committee work, and policy positions with comprehensive data and insights.',
  };
}

async function getLeaderboardData() {
  try {
    // Try to get MEPs with attendance data (new schema)
    const topMEPs = await prisma.mEP.findMany({
      where: { 
        active: true,
        attendancePct: { not: null }
      },
      include: {
        country: true,
        party: true,
      },
      orderBy: { attendancePct: 'desc' },
      take: 10,
    });

    const bottomMEPs = await prisma.mEP.findMany({
      where: { 
        active: true,
        attendancePct: { not: null },
        votesTotal: { gt: 100 },
      },
      include: {
        country: true,
        party: true,
      },
      orderBy: { attendancePct: 'asc' },
      take: 10,
    });

    return { topMEPs, bottomMEPs };
  } catch (error) {
    // Fallback for old schema - just get some MEPs without attendance data
    console.log('Using fallback leaderboard data (old schema)');
    
    const fallbackMEPs = await prisma.mEP.findMany({
      where: { active: true },
      include: {
        country: true,
        party: true,
      },
      take: 20,
    });

    // Split into top and bottom (just for display purposes)
    const topMEPs = fallbackMEPs.slice(0, 10);
    const bottomMEPs = fallbackMEPs.slice(10, 20);

    return { topMEPs, bottomMEPs };
  }
}

async function getStats() {
  const [mepCount, voteCount, countryCount, partyCount] = await Promise.all([
    prisma.mEP.count({ where: { active: true } }),
    prisma.vote.count(),
    prisma.country.count(),
    prisma.party.count(),
  ]);

  return { mepCount, voteCount, countryCount, partyCount };
}

export default async function HomePage() {
  const [leaderboardData, stats] = await Promise.all([
    getLeaderboardData(),
    getStats(),
  ]);

  return (
    <HomePageClient 
      topMEPs={leaderboardData.topMEPs}
      bottomMEPs={leaderboardData.bottomMEPs}
      stats={stats}
    />
  );
}