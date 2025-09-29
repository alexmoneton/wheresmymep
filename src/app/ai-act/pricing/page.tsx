import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFlag } from '@/lib/flags';
import { PricingClient } from './PricingClient';

export const metadata: Metadata = {
  title: 'AI Act Radar Pricing | Where\'s My MEP?',
  description: 'Choose the right plan for your team to stay updated on AI Act changes and compliance requirements.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PricingPage() {
  // Check if Act Radar feature is enabled
  if (!getFlag('actradar')) {
    notFound();
  }

  return <PricingClient />;
}