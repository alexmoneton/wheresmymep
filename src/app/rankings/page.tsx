import { Metadata } from 'next';
import { generatePageSEO } from '@/app/seo.config';
import { generateCollectionPageJSONLD } from '@/lib/seo/jsonld';
import RankingsClientPage from './RankingsClientPage';

export const revalidate = 43200; // 12 hours

export async function generateMetadata(): Promise<Metadata> {
  const seo = generatePageSEO(
    'MEP Rankings - Performance & Activity | Where\'s My MEP?',
    'View comprehensive rankings of Members of the European Parliament by attendance, activity, and policy positions. Track MEP performance across different metrics.',
    '/rankings'
  );

  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default function RankingsPage() {
  const rankingCategories = [
    {
      slug: 'attendance',
      name: 'Attendance Rankings',
      description: 'MEPs ranked by their attendance in roll-call votes',
      icon: '📊',
    },
    {
      slug: 'most-active',
      name: 'Most Active MEPs',
      description: 'MEPs with the highest overall activity levels',
      icon: '⚡',
    },
    {
      slug: 'climate-environment',
      name: 'Climate & Environment',
      description: 'MEPs ranked by their support for climate and environmental policies',
      icon: '🌱',
    },
    {
      slug: 'energy',
      name: 'Energy Policy',
      description: 'MEPs ranked by their positions on energy-related votes',
      icon: '⚡',
    },
    {
      slug: 'migration-asylum',
      name: 'Migration & Asylum',
      description: 'MEPs ranked by their voting on migration and asylum policies',
      icon: '🚶',
    },
    {
      slug: 'digital-technology',
      name: 'Digital & Technology',
      description: 'MEPs ranked by their support for digital and technology policies',
      icon: '💻',
    },
    {
      slug: 'trade-economy',
      name: 'Trade & Economy',
      description: 'MEPs ranked by their positions on trade and economic policies',
      icon: '💰',
    },
    {
      slug: 'agriculture',
      name: 'Agriculture',
      description: 'MEPs ranked by their support for agricultural policies',
      icon: '🚜',
    },
    {
      slug: 'health',
      name: 'Health Policy',
      description: 'MEPs ranked by their positions on health-related votes',
      icon: '🏥',
    },
    {
      slug: 'education-culture',
      name: 'Education & Culture',
      description: 'MEPs ranked by their support for education and cultural policies',
      icon: '📚',
    },
    {
      slug: 'transport',
      name: 'Transport',
      description: 'MEPs ranked by their positions on transport and infrastructure policies',
      icon: '🚗',
    },
    {
      slug: 'defense-security',
      name: 'Defense & Security',
      description: 'MEPs ranked by their voting on defense and security policies',
      icon: '🛡️',
    },
    {
      slug: 'foreign-affairs',
      name: 'Foreign Affairs',
      description: 'MEPs ranked by their positions on foreign policy issues',
      icon: '🌍',
    },
    {
      slug: 'human-rights',
      name: 'Human Rights',
      description: 'MEPs ranked by their support for human rights policies',
      icon: '🤝',
    },
    {
      slug: 'democracy-rule-of-law',
      name: 'Democracy & Rule of Law',
      description: 'MEPs ranked by their support for democratic processes and rule of law',
      icon: '⚖️',
    },
    {
      slug: 'justice-home-affairs',
      name: 'Justice & Home Affairs',
      description: 'MEPs ranked by their positions on justice and home affairs policies',
      icon: '🏛️',
    },
  ];

  // Generate JSON-LD
  const jsonld = generateCollectionPageJSONLD(
    {
      name: 'MEP Rankings - Performance & Activity',
      description: 'Comprehensive rankings of Members of the European Parliament by attendance, activity, and policy positions',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'}/rankings`,
      numberOfItems: rankingCategories.length,
    },
    process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <RankingsClientPage rankingCategories={rankingCategories} />
    </>
  );
}
