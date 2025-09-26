import { Metadata } from 'next';
import { notFound } from 'next/navigation';
// import { PrismaClient } from '@prisma/client';
// import { mepCopy, mepMetaDescription, mepTitle } from '@/lib/copy/mep';
// import { generatePersonJSONLD } from '@/lib/seo/jsonld';
// import { generateMEPSEO } from '@/app/seo.config';
// import MEPClientPage from './MEPClientPage';

// const prisma = new PrismaClient();

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
        take: 10,
      },
    },
  });

  if (!mep) {
    return null;
  }

  // Get attendance data
  const attendance = await prisma.attendance.findMany({
    where: { mepId: mep.id },
    orderBy: { date: 'desc' },
    take: 180, // Last 180 days
  });

  const totalVotes = attendance.length;
  const presentVotes = attendance.filter(a => a.present).length;
  const attendancePct = totalVotes > 0 ? Math.round((presentVotes / totalVotes) * 100) : 0;

  return {
    ...mep,
    attendancePct,
    votesCast: presentVotes,
    votesTotal: totalVotes,
  };
}

export async function generateMetadata({ params }: MEPPageProps): Promise<Metadata> {
  return {
    title: 'MEP Profile | Where\'s My MEP?',
    description: 'MEP profile page - temporarily disabled for debugging.',
  };
}

export default async function MEPPage({ params }: MEPPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            MEP Profile: {params.slug}
          </h1>
          <p className="text-gray-600">
            This MEP profile page is temporarily disabled for debugging.
          </p>
        </div>
      </div>
    </div>
  );
}
