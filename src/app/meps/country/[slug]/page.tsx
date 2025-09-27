import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { generatePageSEO } from '@/app/seo.config';
import { generateCollectionPageJSONLD } from '@/lib/seo/jsonld';
import CountryMEPsClientPage from './CountryMEPsClientPage';

const prisma = new PrismaClient();

interface CountryPageProps {
  params: { slug: string };
}

export const revalidate = 43200; // 12 hours

async function getCountryData(slug: string) {
  const country = await prisma.country.findUnique({
    where: { slug },
    include: {
      meps: {
        where: { active: true },
        include: {
          party: true,
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

  if (!country) {
    return null;
  }

  // Get attendance statistics
  const mepIds = country.meps.map(mep => mep.id);
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

  const mepsWithAttendance = country.meps.map(mep => {
    const stats = mepAttendanceMap.get(mep.id) || { total: 0, present: 0 };
    const attendancePct = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    return {
      ...mep,
      attendancePct,
      votesCast: stats.present,
      votesTotal: stats.total,
    };
  });

  return {
    ...country,
    meps: mepsWithAttendance,
    totalMEPs: country.meps.length,
    averageAttendance: mepsWithAttendance.length > 0 
      ? Math.round(mepsWithAttendance.reduce((sum, mep) => sum + mep.attendancePct, 0) / mepsWithAttendance.length)
      : 0,
  };
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const countryData = await getCountryData(params.slug);
  
  if (!countryData) {
    return {
      title: 'Country Not Found | Where\'s My MEP?',
      description: 'The requested country could not be found.',
    };
  }

  const seo = generatePageSEO(
    `${countryData.name} MEPs - European Parliament Representatives | Where's My MEP?`,
    `View all Members of the European Parliament from ${countryData.name}. Track attendance rates, voting records, and committee work of ${countryData.totalMEPs} MEPs representing ${countryData.name}.`,
    `/meps/country/${countryData.slug}`
  );

  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default async function CountryMEPsPage({ params }: CountryPageProps) {
  const countryData = await getCountryData(params.slug);
  
  if (!countryData) {
    notFound();
  }

  // Generate JSON-LD
  const jsonld = generateCollectionPageJSONLD(
    {
      name: `${countryData.name} MEPs`,
      description: `All Members of the European Parliament representing ${countryData.name}`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'}/meps/country/${countryData.slug}`,
      numberOfItems: countryData.totalMEPs,
    },
    process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <CountryMEPsClientPage countryData={countryData} />
    </>
  );
}


