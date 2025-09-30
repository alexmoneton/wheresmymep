import { Metadata } from 'next';
import { WhoFundsClient } from './WhoFundsClient';

export const metadata: Metadata = {
  title: 'WhoFundsMyMEP (preview) — outside income & support | Where\'s My MEP?',
  description: 'Preview: We summarise Declarations of Members\' Financial/Private Interests and link to official PDFs.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function WhoFundsPage() {
  return <WhoFundsClient />;
}
