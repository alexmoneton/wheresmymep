'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { hasAnyFlagEnabled, getFlag } from '@/lib/flags';

export function PreviewBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if any flag is enabled
    const checkFlags = () => {
      const hasFlags = hasAnyFlagEnabled();
      setIsVisible(hasFlags);
    };

    // Check on mount
    checkFlags();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkFlags();
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

  // Check if Act Radar is specifically enabled
  const actRadarEnabled = getFlag('actradar');

  return (
    <div className={`border-b px-4 py-2 text-sm ${actRadarEnabled ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${actRadarEnabled ? 'text-purple-800' : 'text-blue-800'}`}>
            {actRadarEnabled ? 'Act Radar (preview) is ON' : 'Preview features are ON'}
          </span>
          <span className={actRadarEnabled ? 'text-purple-600' : 'text-blue-600'}>
            — manage at{' '}
            <Link 
              href="/preview" 
              className={`underline hover:${actRadarEnabled ? 'text-purple-800' : 'text-blue-800'} focus:outline-none focus:ring-2 focus:ring-${actRadarEnabled ? 'purple' : 'blue'}-500 focus:ring-offset-2 rounded`}
            >
              /preview
            </Link>
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className={`${actRadarEnabled ? 'text-purple-600 hover:text-purple-800 focus:ring-purple-500' : 'text-blue-600 hover:text-blue-800 focus:ring-blue-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 rounded p-1`}
          aria-label="Dismiss preview banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}