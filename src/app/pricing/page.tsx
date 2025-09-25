import { Metadata } from 'next';
import { generatePageSEO } from '@/app/seo.config';
import PricingClientPage from './PricingClientPage';

export const revalidate = 86400; // 24 hours

export async function generateMetadata(): Promise<Metadata> {
  const seo = generatePageSEO(
    'Pricing - Pro Features & API Access | Where\'s My MEP?',
    'Choose the right plan for your needs. Get advanced features, API access, and priority support with our pro subscriptions.',
    '/pricing'
  );

  return {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
  };
}

export default function PricingPage() {
  return <PricingClientPage />;
}
