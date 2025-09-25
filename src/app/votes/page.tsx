import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { generatePageSEO } from '@/app/seo.config';
import { generateCollectionPageJSONLD } from '@/lib/seo/jsonld';
import VotesClientPage from './VotesClientPage';

const prisma = new PrismaClient();

export const revalidate = 43200; // 12 hours

async function getVotes() {
  return await prisma.vote.findMany({
    include: {
      dossier: true,
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
    take: 100, // Most recent 100 votes
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = generatePageSEO(
    'Recent Votes - European Parliament Roll-Call Votes | Where\'s My MEP?',
    'Explore recent roll-call votes in the European Parliament. Track how MEPs voted on key policy issues, amendments, and legislative proposals.',
    '/votes'
  );

  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default async function VotesPage() {
  const votes = await getVotes();

  // Generate JSON-LD
  const jsonld = generateCollectionPageJSONLD(
    {
      name: 'Recent European Parliament Votes',
      description: 'Recent roll-call votes in the European Parliament with MEP voting records',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'}/votes`,
      numberOfItems: votes.length,
    },
    process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <VotesClientPage votes={votes} />
    </>
  );
}
