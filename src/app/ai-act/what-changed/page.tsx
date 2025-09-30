import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WhatChangedClient } from './WhatChangedClient';

export const metadata: Metadata = {
  title: 'What changed this week | EU Act Radar',
  description: 'Weekly summary of AI Act updates including new guidance, delegated acts, and notable clarifications.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function WhatChangedPage() {
  // Hard kill switch for EU Act Radar
  if (process.env.KILL_ACTRADAR === 'true') {
    notFound();
  }

  return <WhatChangedClient />;
}