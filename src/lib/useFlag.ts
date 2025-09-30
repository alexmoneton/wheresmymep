'use client';

import { useState, useEffect } from 'react';
import { getFlag, setFlag, type FlagName } from './flags';

/**
 * React hook for feature flags
 * Returns the current flag value and a setter function
 * Automatically updates when localStorage changes
 */
export function useFlag(name: FlagName): [boolean, (value: boolean) => void] {
  const [flagValue, setFlagValue] = useState<boolean>(() => getFlag(name));

  useEffect(() => {
    // Update flag value when localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `ff_${name}` && e.newValue !== null) {
        setFlagValue(e.newValue === 'true');
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom storage events from the same tab
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === `ff_${name}`) {
        setFlagValue(e.detail.newValue === 'true');
      }
    };

    window.addEventListener('flagChange', handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('flagChange', handleCustomStorageChange as EventListener);
    };
  }, [name]);

  const updateFlag = (value: boolean) => {
    setFlag(name, value);
    setFlagValue(value);
  };

  return [flagValue, updateFlag];
}