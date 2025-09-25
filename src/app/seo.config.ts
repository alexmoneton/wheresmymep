import { DefaultSeoProps } from 'next-seo';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu';

export const defaultSEO: DefaultSeoProps = {
  titleTemplate: '%s | Where\'s My MEP?',
  defaultTitle: 'Where\'s My MEP? - European Parliament Attendance Tracker',
  description: 'Track attendance rates and voting records of Members of the European Parliament. Monitor MEP performance, committee work, and policy positions with comprehensive data and insights.',
  canonical: baseUrl,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Where\'s My MEP?',
    title: 'Where\'s My MEP? - European Parliament Attendance Tracker',
    description: 'Track attendance rates and voting records of Members of the European Parliament. Monitor MEP performance, committee work, and policy positions.',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Where\'s My MEP? - European Parliament Attendance Tracker',
      },
    ],
  },
  twitter: {
    handle: '@wheresmymep',
    site: '@wheresmymep',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content: 'European Parliament, MEP, attendance, voting, democracy, transparency, EU politics, roll-call votes, parliamentary accountability',
    },
    {
      name: 'author',
      content: 'Where\'s My MEP?',
    },
    {
      name: 'robots',
      content: 'index, follow',
    },
    {
      name: 'language',
      content: 'en',
    },
    {
      name: 'revisit-after',
      content: '1 day',
    },
    {
      name: 'distribution',
      content: 'global',
    },
    {
      name: 'rating',
      content: 'general',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
    {
      rel: 'canonical',
      href: baseUrl,
    },
  ],
};

export const generatePageSEO = (title: string, description: string, path: string, image?: string) => ({
  title,
  description,
  canonical: `${baseUrl}${path}`,
  openGraph: {
    title,
    description,
    url: `${baseUrl}${path}`,
    images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : defaultSEO.openGraph?.images,
  },
  twitter: {
    ...defaultSEO.twitter,
    title,
    description,
  },
});

export const generateMEPSEO = (mep: { firstName: string; lastName: string; country: { name: string }; party?: { name: string; abbreviation?: string } }, attendancePct?: number) => {
  const fullName = `${mep.firstName} ${mep.lastName}`;
  const partyText = mep.party ? ` (${mep.party.abbreviation || mep.party.name})` : '';
  const attendanceText = attendancePct !== undefined ? ` - ${attendancePct}% attendance` : '';
  
  const title = `${fullName} - ${mep.country.name} MEP${partyText} | Where's My MEP?`;
  const description = `${fullName} - ${mep.country.name} MEP${partyText}${attendanceText}. Track voting record, committee work, and attendance in European Parliament roll-call votes.`;
  const path = `/meps/${fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
  
  return generatePageSEO(title, description, path);
};

export const generateCommitteeSEO = (committee: { name: string; code: string; description?: string }) => {
  const title = `${committee.name} (${committee.code}) Committee | Where's My MEP?`;
  const description = `${committee.name} (${committee.code}) - ${committee.description || 'European Parliament committee'}. View members, recent votes, and committee work.`;
  const path = `/committees/${committee.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
  
  return generatePageSEO(title, description, path);
};

export const generateDossierSEO = (dossier: { title: string; code?: string; summary?: string; policyAreas: string[] }) => {
  const title = `${dossier.title}${dossier.code ? ` (${dossier.code})` : ''} | Where's My MEP?`;
  const shortSummary = dossier.summary ? dossier.summary.substring(0, 120) + '...' : 'European Parliament legislative proposal';
  const areasText = dossier.policyAreas.length > 0 ? ` (${dossier.policyAreas.join(', ')})` : '';
  const description = `${dossier.title}${dossier.code ? ` (${dossier.code})` : ''}${areasText} - ${shortSummary}`;
  const path = `/dossiers/${dossier.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
  
  return generatePageSEO(title, description, path);
};

export const generateVoteSEO = (vote: { title: string; date: string; totalFor: number; totalAgainst: number; result: string }) => {
  const dateText = new Date(vote.date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  const title = `${vote.title} - ${dateText} | Where's My MEP?`;
  const description = `${vote.title} - ${dateText} vote (${vote.result}: ${vote.totalFor} for, ${vote.totalAgainst} against). European Parliament roll-call vote results.`;
  const path = `/votes/${vote.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
  
  return generatePageSEO(title, description, path);
};

export const generateTopicSEO = (topic: { name: string; description?: string }) => {
  const title = `${topic.name} - MEP Rankings & Votes | Where's My MEP?`;
  const shortDesc = topic.description ? topic.description.substring(0, 100) + '...' : 'European Parliament policy area';
  const description = `${topic.name} - ${shortDesc}. View MEP rankings, recent votes, and policy positions.`;
  const path = `/topics/${topic.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
  
  return generatePageSEO(title, description, path);
};
