import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import APIKeysClientPage from './APIKeysClientPage';

export const metadata: Metadata = {
  title: 'API Keys | Where\'s My MEP?',
  description: 'Manage your API keys for programmatic access to MEP data.',
};

export default async function APIKeysPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  return <APIKeysClientPage user={session.user} />;
}

