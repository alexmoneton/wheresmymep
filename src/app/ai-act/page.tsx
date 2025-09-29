import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFlag } from '@/lib/flags';
import { AIActIndexClient } from './AIActIndexClient';

export const metadata: Metadata = {
  title: 'EU Act Radar — don\'t miss AI Act updates | Where\'s My MEP?',
  description: 'A simple way to get alerts when the AI Act moves: new guidance, delegated acts, and duties that matter to you.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function AIActIndexPage() {
  // Check if Act Radar feature is enabled
  if (!getFlag('actradar')) {
    notFound();
  }

  return <AIActIndexClient />;
}