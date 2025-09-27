import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { topicCopy, topicMetaDescription, topicTitle } from '@/lib/copy/topic';
import { generatePageSEO } from '@/app/seo.config';
import TopicClientPage from './TopicClientPage';

const prisma = new PrismaClient();

interface TopicPageProps {
  params: { slug: string };
}

export const revalidate = 43200; // 12 hours

async function getTopicData(slug: string) {
  const topic = await prisma.topic.findUnique({
    where: { slug },
  });

  if (!topic) {
    return null;
  }

  // Get MEPs with votes related to this topic
  // This would need to be implemented based on your data structure
  // For now, we'll create a placeholder structure
  const meps = await prisma.mEP.findMany({
    where: { active: true },
    include: {
      country: true,
      party: true,
      votes: {
        include: {
          vote: true,
        },
        take: 10,
      },
    },
    take: 50, // Top 50 MEPs for this topic
  });

  // Calculate topic-specific scores (placeholder logic)
  const mepsWithScores = meps.map((mep, index) => ({
    ...mep,
    score: Math.max(60, 100 - index * 2), // Placeholder scoring
    position: index + 1,
  }));

  // Get recent votes related to this topic
  const recentVotes = await prisma.vote.findMany({
    where: {
      title: {
        contains: topic.name.split(' ')[0], // Simple keyword matching
      },
    },
    include: {
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
    orderBy: {
      date: 'desc',
    },
    take: 10,
  });

  return {
    ...topic,
    rankings: mepsWithScores,
    recentVotes,
  };
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const topicData = await getTopicData(params.slug);
  
  if (!topicData) {
    return {
      title: 'Topic Not Found | Where\'s My MEP?',
      description: 'The requested policy topic could not be found.',
    };
  }

  const seo = generatePageSEO(
    topicTitle(topicData),
    topicMetaDescription(topicData),
    `/topics/${topicData.slug}`
  );

  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const topicData = await getTopicData(params.slug);
  
  if (!topicData) {
    notFound();
  }

  // Prepare data for copy generation
  const rankings = topicData.rankings.map(r => ({
    mep: {
      name: `${r.firstName} ${r.lastName}`,
      country: r.country.name,
      party: r.party?.name || 'Non-attached',
    },
    score: r.score,
    position: r.position,
  }));

  const recentVotes = topicData.recentVotes.map(v => ({
    title: v.title,
    date: v.date.toISOString(),
    result: 'adopted', // Placeholder
    totalFor: v.mepVotes.filter(mv => mv.choice === 'for').length,
    totalAgainst: v.mepVotes.filter(mv => mv.choice === 'against').length,
  }));

  const contextualCopy = topicCopy({
    topic: topicData,
    rankings,
    recentVotes,
  });

  return (
    <TopicClientPage 
      topic={topicData} 
      contextualCopy={contextualCopy}
      rankings={rankings}
      recentVotes={recentVotes}
    />
  );
}


