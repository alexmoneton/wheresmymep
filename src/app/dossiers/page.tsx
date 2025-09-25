import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import { generatePageSEO } from '@/app/seo.config';
import { generateCollectionPageJSONLD } from '@/lib/seo/jsonld';
import DossiersClientPage from './DossiersClientPage';

const prisma = new PrismaClient();

export const revalidate = 43200; // 12 hours

async function getDossiers() {
  return await prisma.dossier.findMany({
    include: {
      votes: {
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
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: {
      title: 'asc',
    },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = generatePageSEO(
    'Legislative Dossiers - European Parliament Proposals | Where\'s My MEP?',
    'Explore current legislative dossiers and proposals in the European Parliament. Track the progress of key policy initiatives and see how MEPs vote on important legislation.',
    '/dossiers'
  );

  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default async function DossiersPage() {
  const dossiers = await getDossiers();

  // Generate JSON-LD
  const jsonld = generateCollectionPageJSONLD(
    {
      name: 'Legislative Dossiers',
      description: 'Current legislative proposals and dossiers in the European Parliament',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'}/dossiers`,
      numberOfItems: dossiers.length,
    },
    process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <DossiersClientPage dossiers={dossiers} />
    </>
  );
}
