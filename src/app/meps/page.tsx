import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';
import MEPsClientPage from './MEPsClientPage';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 43200; // 12 hours

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'All MEPs - European Parliament Members | Where\'s My MEP?',
    description: 'Browse all Members of the European Parliament. Filter by country, party, committee, and track attendance rates and voting records.',
  };
}

async function getMEPs() {
  try {
    return await prisma.mEP.findMany({
      where: { active: true },
      include: {
        country: true,
        party: true,
        memberships: {
          include: { committee: true },
        },
      },
      orderBy: [
        { country: { name: 'asc' } },
        { lastName: 'asc' },
      ],
    });
  } catch (error) {
    console.error('Error fetching MEPs:', error);
    return [];
  }
}

async function getCountries() {
  try {
    return await prisma.country.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
}

async function getParties() {
  try {
    return await prisma.party.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching parties:', error);
    return [];
  }
}

async function getCommittees() {
  try {
    return await prisma.committee.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching committees:', error);
    return [];
  }
}

export default async function MEPsPage() {
  const [meps, countries, parties, committees] = await Promise.all([
    getMEPs(),
    getCountries(),
    getParties(),
    getCommittees(),
  ]);

  return (
    <MEPsClientPage 
      meps={meps}
      countries={countries}
      parties={parties}
      committees={committees}
    />
  );
}
