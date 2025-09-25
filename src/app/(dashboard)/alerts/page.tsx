import { Metadata } from 'next';
import { generatePageSEO } from '@/app/seo.config';
import AlertsClientPage from './AlertsClientPage';

export const revalidate = 0; // Always fresh

export async function generateMetadata(): Promise<Metadata> {
  const seo = generatePageSEO(
    'Alerts - Track MEP Activity | Where\'s My MEP?',
    'Set up alerts to track MEP attendance, voting patterns, and policy positions. Get notified when your representatives miss votes or change their positions.',
    '/alerts'
  );

  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default function AlertsPage() {
  return <AlertsClientPage />;
}
