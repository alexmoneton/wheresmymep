'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';

interface WatchMEPButtonProps {
  mepId: string;
  mepName: string;
  className?: string;
}

export function WatchMEPButton({ mepId, mepName, className }: WatchMEPButtonProps) {
  // Don't use useSession to avoid SessionProvider requirement
  const [isWatching, setIsWatching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false); // Changed to false since we're not checking session
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status and watch status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/whofunds/watch');
        if (response.status === 401) {
          // Not authenticated
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }
        
        if (response.ok) {
          setIsAuthenticated(true);
          const data = await response.json();
          const isWatchingMEP = data.watches.some((watch: any) => watch.mepId === mepId);
          setIsWatching(isWatchingMEP);
        }
      } catch (error) {
        console.error('Error checking watch status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();
  }, [mepId]);

  const handleToggleWatch = async () => {
    if (!isAuthenticated) {
      // Redirect to sign in
      window.location.href = '/auth/signin';
      return;
    }

    setIsLoading(true);
    
    try {
      const action = isWatching ? 'unwatch' : 'watch';
      const response = await fetch('/api/whofunds/watch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mepId,
          action
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsWatching(data.watching);
      } else if (response.status === 401) {
        // Session expired, redirect to sign in
        window.location.href = '/auth/signin';
      } else {
        console.error('Failed to toggle watch status');
      }
    } catch (error) {
      console.error('Error toggling watch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <Button disabled className={className}>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button 
        onClick={() => window.location.href = '/auth/signin'}
        className={className}
      >
        <Bell className="h-4 w-4 mr-2" />
        Sign in to watch
      </Button>
    );
  }

  return (
    <Button
      onClick={handleToggleWatch}
      disabled={isLoading}
      variant={isWatching ? "outline" : "default"}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : isWatching ? (
        <BellOff className="h-4 w-4 mr-2" />
      ) : (
        <Bell className="h-4 w-4 mr-2" />
      )}
      {isWatching ? 'Stop watching' : 'Watch this MEP'}
    </Button>
  );
}
