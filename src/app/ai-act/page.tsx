import { Metadata } from 'next';
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
  return <AIActIndexClient />;
}