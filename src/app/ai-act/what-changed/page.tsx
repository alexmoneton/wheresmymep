import { Metadata } from 'next';
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
  return <WhatChangedClient />;
}