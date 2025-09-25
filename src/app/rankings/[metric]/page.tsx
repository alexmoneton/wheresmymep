import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { generatePageSEO } from '@/app/seo.config';
import RankingClientPage from './RankingClientPage';

const prisma = new PrismaClient();

interface RankingPageProps {
  params: { metric: string };
}

export const revalidate = 43200; // 12 hours

async function getRankingData(metric: string) {
  // Define valid metrics
  const validMetrics = [
    'attendance',
    'most-active',
    'climate-environment',
    'energy',
    'migration-asylum',
    'digital-technology',
    'trade-economy',
    'agriculture',
    'health',
    'education-culture',
    'transport',
    'defense-security',
    'foreign-affairs',
    'human-rights',
    'democracy-rule-of-law',
    'justice-home-affairs',
  ];

  if (!validMetrics.includes(metric)) {
    return null;
  }

  // Get MEPs with attendance data
  const meps = await prisma.mEP.findMany({
    where: { active: true },
    include: {
      country: true,
      party: true,
      memberships: {
        include: {
          committee: true,
        },
      },
    },
  });

  // Get attendance data for all MEPs
  const mepIds = meps.map(mep => mep.id);
  const attendance = await prisma.attendance.findMany({
    where: { 
      mepId: { in: mepIds },
    },
    orderBy: { date: 'desc' },
    take: 180 * mepIds.length, // Last 180 days for all MEPs
  });

  // Calculate attendance for each MEP
  const mepAttendanceMap = new Map();
  for (const att of attendance) {
    if (!mepAttendanceMap.has(att.mepId)) {
      mepAttendanceMap.set(att.mepId, { total: 0, present: 0 });
    }
    const stats = mepAttendanceMap.get(att.mepId);
    stats.total++;
    if (att.present) stats.present++;
  }

  // Calculate scores based on metric
  const mepsWithScores = meps.map(mep => {
    const stats = mepAttendanceMap.get(mep.id) || { total: 0, present: 0 };
    const attendancePct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    
    let score = attendancePct;
    let scoreType = 'attendance';
    
    // Adjust scoring based on metric
    switch (metric) {
      case 'attendance':
        score = attendancePct;
        scoreType = 'attendance';
        break;
      case 'most-active':
        score = stats.total; // Total votes participated in
        scoreType = 'activity';
        break;
      default:
        // For topic-based rankings, use placeholder logic
        score = Math.max(60, attendancePct + Math.random() * 20 - 10);
        scoreType = 'topic';
        break;
    }
    
    return {
      ...mep,
      attendancePct,
      votesCast: stats.present,
      votesTotal: stats.total,
      score,
      scoreType,
    };
  });

  // Sort by score (descending)
  const sortedMEPs = mepsWithScores.sort((a, b) => b.score - a.score);

  // Add position
  const rankedMEPs = sortedMEPs.map((mep, index) => ({
    ...mep,
    position: index + 1,
  }));

  return {
    metric,
    meps: rankedMEPs,
    totalMEPs: rankedMEPs.length,
    scoreType: rankedMEPs[0]?.scoreType || 'attendance',
  };
}

export async function generateMetadata({ params }: RankingPageProps): Promise<Metadata> {
  const rankingData = await getRankingData(params.metric);
  
  if (!rankingData) {
    return {
      title: 'Ranking Not Found | Where\'s My MEP?',
      description: 'The requested ranking could not be found.',
    };
  }

  const title = `${params.metric.charAt(0).toUpperCase() + params.metric.slice(1).replace('-', ' ')} Rankings | Where's My MEP?`;
  const description = `View MEP rankings by ${params.metric.replace('-', ' ')}. Track performance and activity levels of Members of the European Parliament.`;

  const seo = generatePageSEO(title, description, `/rankings/${params.metric}`);

  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default async function RankingPage({ params }: RankingPageProps) {
  const rankingData = await getRankingData(params.metric);
  
  if (!rankingData) {
    notFound();
  }

  return (
    <RankingClientPage rankingData={rankingData} />
  );
}
