'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Zap, Star, Users } from 'lucide-react';
import { toast } from 'sonner';

interface PaywallProps {
  feature: string;
  requiredPlan?: 'individual' | 'team' | 'enterprise';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function Paywall({ 
  feature, 
  requiredPlan = 'individual', 
  children, 
  fallback 
}: PaywallProps) {
  const { data: session } = useSession();
  const [showUpgrade, setShowUpgrade] = useState(false);

  // For demo purposes, we'll assume free users can't access premium features
  // In a real app, you'd check the user's actual subscription status
  const hasAccess = session?.user && showUpgrade; // This would be based on actual subscription

  if (!session?.user) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-8 text-center">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sign in required
          </h3>
          <p className="text-gray-600 mb-4">
            Please sign in to access {feature}.
          </p>
          <Button onClick={() => window.location.href = '/auth/signin'}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Lock className="h-12 w-12 text-blue-600" />
              <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white">
                {requiredPlan === 'individual' && <Zap className="h-3 w-3 mr-1" />}
                {requiredPlan === 'team' && <Users className="h-3 w-3 mr-1" />}
                {requiredPlan === 'enterprise' && <Star className="h-3 w-3 mr-1" />}
                {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
              </Badge>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {feature} requires {requiredPlan} plan
          </h3>
          
          <p className="text-gray-600 mb-6">
            Upgrade to the {requiredPlan} plan to unlock this feature and more.
          </p>

          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/pricing'}
              className="w-full"
            >
              View Plans
            </Button>
            
            {fallback && (
              <Button 
                variant="outline" 
                onClick={() => setShowUpgrade(true)}
                className="w-full"
              >
                Try Free Version
              </Button>
            )}
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>✨ 14-day free trial • Cancel anytime • No setup fees</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

// Hook for checking feature access
export function useFeatureAccess(feature: string, requiredPlan: string = 'individual') {
  const { data: session } = useSession();
  
  // In a real app, you'd check the user's subscription status
  const hasAccess = session?.user; // This would be based on actual subscription
  
  return {
    hasAccess,
    isLoading: !session,
    upgradeUrl: '/pricing',
  };
}

