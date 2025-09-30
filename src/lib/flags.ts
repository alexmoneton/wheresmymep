/**
 * Feature flag system for preview features
 * Checks localStorage first, then falls back to environment variables
 */

export type FlagName = 'alerts' | 'csv' | 'changes' | 'actradar';

export function parseBoolEnv(v?: string | undefined): boolean {
  const s = (v ?? '').trim().toLowerCase()
  return s === 'true' || s === '1' || s === 'yes' || s === 'on'
}

export const FLAG_VERSION = Number(process.env.NEXT_PUBLIC_FLAG_VERSION ?? '1')

// Call on client once (e.g., in a small InitFlags client component or inside useFlag):
export function ensureFlagVersion(): void {
  try {
    const key = 'ff_version'
    const cur = Number(localStorage.getItem(key) ?? '0')
    if (cur !== FLAG_VERSION) {
      ;['ff_alerts','ff_csv','ff_actradar','ff_changes'].forEach(k => localStorage.removeItem(k))
      localStorage.setItem(key, String(FLAG_VERSION))
    }
  } catch {}
}

// Defaults from env:
export const ENV_DEFAULTS = {
  alerts:   parseBoolEnv(process.env.NEXT_PUBLIC_FEATURE_ALERTS),
  csv:      parseBoolEnv(process.env.NEXT_PUBLIC_FEATURE_CSV),
  actradar: parseBoolEnv(process.env.NEXT_PUBLIC_FEATURE_ACTRADAR),
  changes:  parseBoolEnv(process.env.NEXT_PUBLIC_FEATURE_CHANGES),
}

/**
 * Get feature flag value from localStorage or environment variable
 * @param name - The flag name
 * @returns boolean value of the flag
 */
export function getFlag(name: FlagName): boolean {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Ensure flag version is up to date
    ensureFlagVersion()
    
    const stored = window.localStorage.getItem(`ff_${name}`);
    if (stored !== null) {
      return stored === 'true';
    }
  }

  // Fallback to environment defaults
  return ENV_DEFAULTS[name];
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
      const defaultValue = ENV_DEFAULTS[flag];
      
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