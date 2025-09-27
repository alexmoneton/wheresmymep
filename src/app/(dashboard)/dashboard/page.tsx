import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClientPage from './DashboardClientPage';
import { SubscriptionManager } from '@/lib/subscriptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: 'Dashboard | Where\'s My MEP?',
  description: 'Manage your alerts, API keys, and subscription.',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Get user's subscription and usage stats
  const [subscription, usageStats] = await Promise.all([
    SubscriptionManager.getUserSubscription(session.user.id),
    SubscriptionManager.getUsageStats(session.user.id),
  ]);

  return (
    <DashboardClientPage 
      user={session.user}
      subscription={subscription}
      usageStats={usageStats}
    />
  );
}

