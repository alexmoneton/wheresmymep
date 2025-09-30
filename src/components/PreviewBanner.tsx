'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { hasAnyFlagEnabled, getFlag } from '@/lib/flags';

export function PreviewBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner should be shown
    const checkBannerVisibility = () => {
      // Check if any ff_* key exists in localStorage (has overrides)
      const hasOverrides = ['ff_alerts', 'ff_csv', 'ff_actradar', 'ff_changes'].some(
        key => localStorage.getItem(key) !== null
      );
      
      // Check if force preview banner is enabled
      const forcePreview = process.env.NEXT_PUBLIC_FORCE_PREVIEW_BANNER === 'true';
      
      setIsVisible(hasOverrides || forcePreview);
    };

    // Check on mount
    checkBannerVisibility();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkBannerVisibility();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom flag changes
    window.addEventListener('flagChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('flagChange', handleStorageChange);
    };
  }, []);

  // Check if banner was dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('preview-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('preview-banner-dismissed', 'true');
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <div className="border-b px-4 py-2 text-sm bg-blue-50 border-blue-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-blue-800">
            Preview features are ON
          </span>
          <span className="text-blue-600">
            — manage at{' '}
            <Link 
              href="/preview" 
              className="underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              /preview
            </Link>
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-600 hover:text-blue-800 focus:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded p-1"
          aria-label="Dismiss preview banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}