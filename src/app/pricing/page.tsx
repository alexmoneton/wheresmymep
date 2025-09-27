import { Metadata } from 'next';
import { PRICING_PLANS, PlanType } from '@/lib/stripe';
import PricingClientPage from './PricingClientPage';

export const metadata: Metadata = {
  title: 'Pricing | Where\'s My MEP?',
  description: 'Choose the perfect plan for tracking European Parliament activity. Free tier available with paid plans for advanced features.',
};

export default function PricingPage() {
  return <PricingClientPage plans={PRICING_PLANS} />;
}