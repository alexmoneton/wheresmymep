import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WhoFundsClient } from './WhoFundsClient';
import { ENV_DEFAULTS } from '@/lib/flags';

export const metadata: Metadata = {
  title: 'WhoFundsMyMEP — Track MEP Outside Income & Financial Interests | Where\'s My MEP?',
  description: 'Discover which MEPs have outside income, board memberships, and financial interests. Track changes in their declarations of financial interests with automated alerts.',
  keywords: ['MEP', 'European Parliament', 'financial interests', 'outside income', 'transparency', 'lobbying', 'board memberships'],
  openGraph: {
    title: 'WhoFundsMyMEP — Track MEP Outside Income & Financial Interests',
    description: 'Discover which MEPs have outside income, board memberships, and financial interests. Track changes with automated alerts.',
    type: 'website',
    url: 'https://wheresmymep.eu/who-funds',
    images: [
      {
        url: 'https://wheresmymep.eu/og-whofunds.png',
        width: 1200,
        height: 630,
        alt: 'WhoFundsMyMEP - Track MEP Financial Interests',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhoFundsMyMEP — Track MEP Outside Income & Financial Interests',
    description: 'Discover which MEPs have outside income, board memberships, and financial interests. Track changes with automated alerts.',
    images: ['https://wheresmymep.eu/og-whofunds.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function WhoFundsPage() {
  // Feature flag guard
  if (!ENV_DEFAULTS.whofunds) {
    notFound();
  }

  return <WhoFundsClient />;
}
