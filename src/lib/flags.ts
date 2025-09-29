/**
 * Feature flag system for preview features
 * Checks localStorage first, then falls back to environment variables
 */

export type FlagName = 'alerts' | 'csv' | 'changes' | 'actradar';

/**
 * Get feature flag value from localStorage or environment variable
 * @param name - The flag name
 * @returns boolean value of the flag
 */
export function getFlag(name: FlagName): boolean {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(`ff_${name}`);
    if (stored !== null) {
      return stored === 'true';
    }
  }

  // Fallback to environment variables
  const envVar = `NEXT_PUBLIC_FEATURE_${name.toUpperCase()}`;
  const envValue = process.env[envVar];
  
  if (envValue !== undefined) {
    return envValue === 'true';
  }

  // Default to false
  return false;
}

/**
 * Set feature flag value in localStorage
 * @param name - The flag name
 * @param value - The boolean value to set
 */
export function setFlag(name: FlagName, value: boolean): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(`ff_${name}`, value.toString());
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: `ff_${name}`,
      newValue: value.toString(),
      oldValue: window.localStorage.getItem(`ff_${name}`),
      storageArea: window.localStorage,
    }));
  }
}

/**
 * Reset all feature flags to their default values (from env vars)
 */
export function resetFlagsToDefaults(): void {
  if (typeof window !== 'undefined') {
    const flags: FlagName[] = ['alerts', 'csv', 'changes', 'actradar'];
    flags.forEach(flag => {
      const envVar = `NEXT_PUBLIC_FEATURE_${flag.toUpperCase()}`;
      const envValue = process.env[envVar];
      const defaultValue = envValue === 'true';
      
      window.localStorage.setItem(`ff_${flag}`, defaultValue.toString());
      
      // Dispatch storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: `ff_${flag}`,
        newValue: defaultValue.toString(),
        oldValue: window.localStorage.getItem(`ff_${flag}`),
        storageArea: window.localStorage,
      }));
    });
  }
}

/**
 * Check if any feature flag is enabled
 * @returns true if at least one flag is enabled
 */
export function hasAnyFlagEnabled(): boolean {
  return getFlag('alerts') || getFlag('csv') || getFlag('changes') || getFlag('actradar');
}