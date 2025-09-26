import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import HomePageClient from './HomePageClient';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Force immediate revalidation

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Where\'s My MEP? - European Parliament Attendance Tracker',
    description: 'Track attendance rates and voting records of Members of the European Parliament. Monitor MEP performance, committee work, and policy positions with comprehensive data and insights.',
  };
}

async function getStats() {
  try {
    const [mepCount, voteCount, countryCount, partyCount] = await Promise.all([
      prisma.mEP.count({ where: { active: true } }),
      prisma.vote.count(),
      prisma.country.count(),
      prisma.party.count(),
    ]);

    return { mepCount, voteCount, countryCount, partyCount };
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return fallback stats
    return { mepCount: 638, voteCount: 1215, countryCount: 27, partyCount: 8 };
  }
}

async function getLeaderboardData() {
  try {
    // Get top performers (highest attendance)
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

    // Get bottom performers (lowest attendance, excluding special cases)
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
    console.error('Error fetching leaderboard data:', error);
    // Return empty arrays as fallback
    return { topMEPs: [], bottomMEPs: [] };
  }
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