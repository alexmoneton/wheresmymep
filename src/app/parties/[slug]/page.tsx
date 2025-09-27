import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { generatePageSEO } from '@/app/seo.config';
import { generateOrganizationJSONLD } from '@/lib/seo/jsonld';
import PartyMEPsClientPage from './PartyMEPsClientPage';

const prisma = new PrismaClient();

interface PartyPageProps {
  params: { slug: string };
}

export const revalidate = 43200; // 12 hours

async function getPartyData(slug: string) {
  const party = await prisma.party.findUnique({
    where: { slug },
    include: {
      meps: {
        where: { active: true },
        include: {
          country: true,
          memberships: {
            include: {
              committee: true,
            },
          },
        },
        orderBy: {
          lastName: 'asc',
        },
      },
    },
  });

  if (!party) {
    return null;
  }

  // Get attendance statistics
  const mepIds = party.meps.map(mep => mep.id);
  const attendance = await prisma.attendance.findMany({
    where: { 
      mepId: { in: mepIds },
    },
    orderBy: { date: 'desc' },
    take: 180 * mepIds.length, // Last 180 days for all MEPs
  });

  // Calculate average attendance
  const mepAttendanceMap = new Map();
  for (const att of attendance) {
    if (!mepAttendanceMap.has(att.mepId)) {
      mepAttendanceMap.set(att.mepId, { total: 0, present: 0 });
    }
    const stats = mepAttendanceMap.get(att.mepId);
    stats.total++;
    if (att.present) stats.present++;
  }

  const mepsWithAttendance = party.meps.map(mep => {
    const stats = mepAttendanceMap.get(mep.id) || { total: 0, present: 0 };
    const attendancePct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    return {
      ...mep,
      attendancePct,
      votesCast: stats.present,
      votesTotal: stats.total,
    };
  });

  // Get country distribution
  const countryCounts = new Map();
  for (const mep of party.meps) {
    const count = countryCounts.get(mep.country.name) || 0;
    countryCounts.set(mep.country.name, count + 1);
  }

  return {
    ...party,
    meps: mepsWithAttendance,
    totalMEPs: party.meps.length,
    averageAttendance: mepsWithAttendance.length > 0 
      ? Math.round(mepsWithAttendance.reduce((sum, mep) => sum + mep.attendancePct, 0) / mepsWithAttendance.length)
      : 0,
    countryDistribution: Array.from(countryCounts.entries()).map(([country, count]) => ({
      country,
      count,
    })),
  };
}

export async function generateMetadata({ params }: PartyPageProps): Promise<Metadata> {
  const partyData = await getPartyData(params.slug);
  
  if (!partyData) {
    return {
      title: 'Party Not Found | Where\'s My MEP?',
      description: 'The requested political party could not be found.',
    };
  }

  const seo = generatePageSEO(
    `${partyData.name} MEPs - European Parliament Political Group | Where's My MEP?`,
    `View all Members of the European Parliament from ${partyData.name} (${partyData.abbreviation || partyData.name}). Track attendance rates, voting records, and committee work of ${partyData.totalMEPs} MEPs in this political group.`,
    `/parties/${partyData.slug}`
  );

  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default async function PartyMEPsPage({ params }: PartyPageProps) {
  const partyData = await getPartyData(params.slug);
  
  if (!partyData) {
    notFound();
  }

  // Generate JSON-LD
  const jsonld = generateOrganizationJSONLD(
    {
      name: partyData.name,
      description: `European Parliament political group: ${partyData.name}`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'}/parties/${partyData.slug}`,
    },
    process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <PartyMEPsClientPage partyData={partyData} />
    </>
  );
}


