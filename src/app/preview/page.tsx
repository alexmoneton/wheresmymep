import { Metadata } from 'next';
import { PreviewPageClient } from './PreviewPageClient';

export const metadata: Metadata = {
  title: 'Preview Features - Where\'s My MEP?',
  description: 'Toggle preview features for Where\'s My MEP?',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreviewPage() {
  return <PreviewPageClient />;
}