import { Metadata } from 'next';
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
  return <PricingClient />;
}