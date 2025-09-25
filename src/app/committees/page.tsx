import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { generatePageSEO } from '@/app/seo.config';
import { generateCollectionPageJSONLD } from '@/lib/seo/jsonld';
import CommitteesClientPage from './CommitteesClientPage';

const prisma = new PrismaClient();

export const revalidate = 43200; // 12 hours

async function getCommittees() {
  return await prisma.committee.findMany({
    include: {
      memberships: {
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
      name: 'asc',
    },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = generatePageSEO(
    'European Parliament Committees | Where\'s My MEP?',
    'Explore all European Parliament committees, their members, and recent work. Track committee activities and MEP participation across different policy areas.',
    '/committees'
  );

  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default async function CommitteesPage() {
  const committees = await getCommittees();
  
  const totalCommittees = committees.length;
  const totalMembers = committees.reduce((sum, committee) => sum + committee.memberships.length, 0);

  // Generate JSON-LD
  const jsonld = generateCollectionPageJSONLD(
    {
      name: 'European Parliament Committees',
      description: 'All committees of the European Parliament with member information and recent activities',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'}/committees`,
      numberOfItems: totalCommittees,
    },
    process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <CommitteesClientPage 
        committees={committees}
        totalCommittees={totalCommittees}
        totalMembers={totalMembers}
      />
    </>
  );
}
