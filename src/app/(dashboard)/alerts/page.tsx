import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AlertsClientPage from './AlertsClientPage';

export const metadata: Metadata = {
  title: 'Manage Alerts | Where\'s My MEP?',
  description: 'Set up and manage alerts for MEP activity, voting patterns, and attendance changes.',
};

export default async function AlertsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return <AlertsClientPage user={session.user} />;
}