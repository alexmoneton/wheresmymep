import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { mepCopy, mepMetaDescription, mepTitle } from '@/lib/copy/mep';
import { generatePersonJSONLD } from '@/lib/seo/jsonld';
// import { generateMEPSEO } from '@/app/seo.config';
import MEPClientPage from './MEPClientPage';

const prisma = new PrismaClient();

interface MEPPageProps {
  params: { slug: string };
}

export const revalidate = 43200; // 12 hours

async function getMEP(slug: string) {
  const mep = await prisma.mEP.findUnique({
    where: { slug },
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
    return null;
  }

  // Use attendance data from MEP model (already calculated)
  return {
    ...mep,
    attendancePct: mep.attendancePct || 0,
    votesCast: mep.votesCast || 0,
    votesTotal: mep.votesTotal || 0,
  };
}

export async function generateMetadata({ params }: MEPPageProps): Promise<Metadata> {
  const mep = await getMEP(params.slug);
  
  if (!mep) {
    return {
      title: 'MEP Not Found | Where\'s My MEP?',
      description: 'The requested MEP could not be found.',
    };
  }

  return {
    title: mepTitle(mep),
    description: mepMetaDescription(mep),
  };
}

export default async function MEPPage({ params }: MEPPageProps) {
  const mep = await getMEP(params.slug);
  
  if (!mep) {
    notFound();
  }

  // Prepare data for copy generation
  const committees = mep.memberships.map(m => ({
    name: m.committee.name,
    role: m.role,
  }));

  const recentVotes = mep.votes.map(mv => ({
    title: mv.vote.title || 'Untitled Vote',
    choice: mv.choice,
    date: mv.vote.date.toISOString(),
  }));

  const contextualCopy = mepCopy({
    mep: {
      firstName: mep.firstName,
      lastName: mep.lastName,
      country: mep.country,
      party: mep.party,
      committees,
      recentVotes,
      attendancePct: mep.attendancePct,
      votesCast: mep.votesCast,
      votesTotal: mep.votesTotal,
    },
    committees,
    recentVotes,
  });

  // Generate JSON-LD
  const jsonld = generatePersonJSONLD(
    {
      firstName: mep.firstName,
      lastName: mep.lastName,
      country: mep.country,
      party: mep.party,
      committees,
      photoUrl: mep.photoUrl,
      twitter: mep.twitter,
      website: mep.website,
    },
    process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <MEPClientPage 
        mep={mep} 
        contextualCopy={contextualCopy}
        committees={committees}
        recentVotes={recentVotes}
      />
    </>
  );
}
