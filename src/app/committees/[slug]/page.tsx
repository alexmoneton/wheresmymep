import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { committeeCopy, committeeMetaDescription, committeeTitle } from '@/lib/copy/committee';
import { generateOrganizationJSONLD } from '@/lib/seo/jsonld';
import { generateCommitteeSEO } from '@/app/seo.config';
import CommitteeClientPage from './CommitteeClientPage';

const prisma = new PrismaClient();

interface CommitteePageProps {
  params: { slug: string };
}

export const revalidate = 43200; // 12 hours

async function getCommittee(slug: string) {
  const committee = await prisma.committee.findUnique({
    where: { slug },
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
        orderBy: [
          { role: 'asc' }, // chair first, then vice-chair, then members
          { mep: { lastName: 'asc' } },
        ],
      },
    },
  });

  if (!committee) {
    return null;
  }

  // Get recent votes related to this committee (this would need to be implemented based on your data structure)
  const recentVotes = []; // Placeholder - would need to query votes by committee

  return {
    ...committee,
    recentVotes,
  };
}

export async function generateMetadata({ params }: CommitteePageProps): Promise<Metadata> {
  const committee = await getCommittee(params.slug);
  
  if (!committee) {
    return {
      title: 'Committee Not Found | Where\'s My MEP?',
      description: 'The requested committee could not be found.',
    };
  }

  const seo = generateCommitteeSEO(committee);

  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default async function CommitteePage({ params }: CommitteePageProps) {
  const committee = await getCommittee(params.slug);
  
  if (!committee) {
    notFound();
  }

  // Prepare data for copy generation
  const members = committee.memberships.map(m => ({
    name: `${m.mep.firstName} ${m.mep.lastName}`,
    country: m.mep.country.name,
    party: m.mep.party?.name || 'Non-attached',
    role: m.role,
  }));

  const contextualCopy = committeeCopy({
    committee: {
      name: committee.name,
      code: committee.code,
      description: committee.description,
    },
    members,
    recentVotes: committee.recentVotes,
  });

  // Generate JSON-LD
  const jsonld = generateOrganizationJSONLD(
    {
      name: `${committee.name} (${committee.code})`,
      description: committee.description || `European Parliament ${committee.name} Committee`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'}/committees/${committee.slug}`,
    },
    process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <CommitteeClientPage 
        committee={committee} 
        contextualCopy={contextualCopy}
        members={members}
      />
    </>
  );
}
