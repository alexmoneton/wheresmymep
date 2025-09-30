import { Metadata } from 'next';
import { redirect } from 'next/navigation';
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
  // Hard kill switch for EU Act Radar
  if (process.env.KILL_ACTRADAR === 'true') {
    redirect('/who-funds');
  }

  return <PricingClient />;
}