import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFlag } from '@/lib/flags';
import { WhatChangedClient } from './WhatChangedClient';

export const metadata: Metadata = {
  title: 'What changed this week (preview) | EU Act Radar',
  description: 'Weekly summary of AI Act updates including new guidance, delegated acts, and notable clarifications.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function WhatChangedPage() {
  // Check if Act Radar feature is enabled
  if (!getFlag('actradar')) {
    notFound();
  }

  return <WhatChangedClient />;
}