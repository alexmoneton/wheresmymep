import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { generatePageSEO } from '@/app/seo.config';
import { generateCollectionPageJSONLD } from '@/lib/seo/jsonld';
import TopicsClientPage from './TopicsClientPage';

const prisma = new PrismaClient();

export const revalidate = 43200; // 12 hours

async function getTopics() {
  return await prisma.topic.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = generatePageSEO(
    'Policy Topics - MEP Rankings | Where\'s My MEP?',
    'Explore MEP rankings and voting patterns across different policy topics. Track how Members of the European Parliament vote on climate, energy, migration, digital policy, and more.',
    '/topics'
  );

  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default async function TopicsPage() {
  const topics = await getTopics();

  // Generate JSON-LD
  const jsonld = generateCollectionPageJSONLD(
    {
      name: 'Policy Topics - MEP Rankings',
      description: 'MEP rankings and voting patterns across different policy areas in the European Parliament',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'}/topics`,
      numberOfItems: topics.length,
    },
    process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <TopicsClientPage topics={topics} />
    </>
  );
}
