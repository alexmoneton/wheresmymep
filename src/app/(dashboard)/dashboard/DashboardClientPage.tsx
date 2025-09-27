'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserSubscription } from '@/lib/subscriptions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bell, 
  Key, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardClientPageProps {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  subscription: UserSubscription | null;
  usageStats: {
    alerts: {
      used: number;
      limit: number;
      unlimited: boolean;
    };
    api: {
      tier: 'free' | 'pro' | 'enterprise';
      requestsPerHour: number;
    };
    subscription: {
      plan: string;
      status: string;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
    } | null;
  };
}

export default function DashboardClientPage({ 
  user, 
  subscription, 
  usageStats 
}: DashboardClientPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast.error('Failed to open subscription management. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'individual': return 'Individual';
      case 'team': return 'Team';
      case 'enterprise': return 'Enterprise';
      default: return 'Free';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name || user.email}!</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usageStats.alerts.used}
                    {usageStats.alerts.unlimited ? '+' : `/${usageStats.alerts.limit}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Key className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">API Tier</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {usageStats.api.tier}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Plan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getPlanDisplayName(usageStats.subscription?.plan || 'free')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">API Limit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usageStats.api.requestsPerHour.toLocaleString()}/hr
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Subscription Status
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Plan</span>
                    <Badge className={getTierColor(usageStats.api.tier)}>
                      {getPlanDisplayName(subscription.plan)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Next Billing</span>
                    <span className="text-sm text-gray-600">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {subscription.cancelAtPeriodEnd && (
                    <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-800">
                        Your subscription will cancel at the end of the current period.
                      </span>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Loading...' : 'Manage Subscription'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Active Subscription
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You're currently on the free plan. Upgrade to unlock more features.
                    </p>
                    <Button 
                      onClick={() => router.push('/pricing')}
                      className="w-full"
                    >
                      View Plans
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Usage Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Usage Overview
              </CardTitle>
              <CardDescription>
                Your current usage and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alerts Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Alerts</span>
                  <span className="text-sm text-gray-600">
                    {usageStats.alerts.used}
                    {usageStats.alerts.unlimited ? '' : ` / ${usageStats.alerts.limit}`}
                  </span>
                </div>
                {!usageStats.alerts.unlimited && (
                  <Progress 
                    value={(usageStats.alerts.used / usageStats.alerts.limit) * 100} 
                    className="h-2"
                  />
                )}
                {usageStats.alerts.unlimited && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Unlimited
                  </div>
                )}
              </div>

              {/* API Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">API Requests</span>
                  <span className="text-sm text-gray-600">
                    {usageStats.api.requestsPerHour.toLocaleString()}/hour
                  </span>
                </div>
                <Badge className={getTierColor(usageStats.api.tier)}>
                  {usageStats.api.tier.toUpperCase()} Tier
                </Badge>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/alerts')}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Manage Alerts
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/api-keys')}
                >
                  <Key className="h-4 w-4 mr-2" />
                  API Keys
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest alerts and API usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity to display</p>
              <p className="text-sm">Create your first alert to get started!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

