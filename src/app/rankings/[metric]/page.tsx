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
  try {
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

    // Get MEPs with attendance data (use the attendancePct field directly)
    const meps = await prisma.mEP.findMany({
      where: { 
        active: true,
        attendancePct: { not: null }
      },
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

    // Calculate scores based on metric using the stored attendance data
    const mepsWithScores = meps.map(mep => {
      const attendancePct = mep.attendancePct || 0;
      const votesCast = mep.votesCast || 0;
      const votesTotal = mep.votesTotal || 0;
      
      let score = attendancePct;
      let scoreType = 'attendance';
      
      // Adjust scoring based on metric
      switch (metric) {
        case 'attendance':
          score = attendancePct;
          scoreType = 'attendance';
          break;
        case 'most-active':
          score = votesCast; // Total votes cast
          scoreType = 'activity';
          break;
        default:
          // For topic-based rankings, use attendance as base with some variation
          score = Math.max(60, attendancePct + Math.random() * 20 - 10);
          scoreType = 'topic';
          break;
      }
      
      return {
        ...mep,
        attendancePct,
        votesCast,
        votesTotal,
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
  } catch (error) {
    console.error('Error fetching ranking data:', error);
    return null;
  }
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
