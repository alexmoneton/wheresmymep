/**
 * Magic link utility for preview features
 * Handles URL query parameters to toggle feature flags
 */

import { setFlag } from './flags';

/**
 * Process magic link query parameters
 * Should be called on route changes or page load
 */
export function processMagicLinks(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const currentUrl = new URL(window.location.href);
  let changed = false;

        // Handle bulk toggle
        if (urlParams.has('all')) {
          const on = ['on','true','1','yes'].includes(urlParams.get('all')!.toLowerCase());
          const flagsToSet = ['alerts','csv','changes','whofunds'];
          // Only include actradar if KILL_ACTRADAR is not set
          if (process.env.KILL_ACTRADAR !== 'true') {
            flagsToSet.push('actradar');
          }
          flagsToSet.forEach(n => setFlag(n as any, on));
          urlParams.delete('all');
          changed = true;
        }

  // Handle individual parameters
  const actradarParam = urlParams.get('actradar');
  // Only process actradar if KILL_ACTRADAR is not set
  if (actradarParam && process.env.KILL_ACTRADAR !== 'true') {
    if (actradarParam === 'on') {
      setFlag('actradar', true);
      urlParams.delete('actradar');
      changed = true;
    } else if (actradarParam === 'off') {
      setFlag('actradar', false);
      urlParams.delete('actradar');
      changed = true;
    }
  } else if (actradarParam && process.env.KILL_ACTRADAR === 'true') {
    // Remove actradar param if KILL_ACTRADAR is set
    urlParams.delete('actradar');
    changed = true;
  }

  const alertsParam = urlParams.get('alerts');
  if (alertsParam === 'on') {
    setFlag('alerts', true);
    urlParams.delete('alerts');
    changed = true;
  } else if (alertsParam === 'off') {
    setFlag('alerts', false);
    urlParams.delete('alerts');
    changed = true;
  }

  const csvParam = urlParams.get('csv');
  if (csvParam === 'on') {
    setFlag('csv', true);
    urlParams.delete('csv');
    changed = true;
  } else if (csvParam === 'off') {
    setFlag('csv', false);
    urlParams.delete('csv');
    changed = true;
  }

        const changesParam = urlParams.get('changes');
        if (changesParam === 'on') {
          setFlag('changes', true);
          urlParams.delete('changes');
          changed = true;
        } else if (changesParam === 'off') {
          setFlag('changes', false);
          urlParams.delete('changes');
          changed = true;
        }

        const whofundsParam = urlParams.get('whofunds');
        if (whofundsParam === 'on') {
          setFlag('whofunds', true);
          urlParams.delete('whofunds');
          changed = true;
        } else if (whofundsParam === 'off') {
          setFlag('whofunds', false);
          urlParams.delete('whofunds');
          changed = true;
        }

  // Update URL if any parameters were processed
  if (changed) {
    updateUrl(urlParams, currentUrl);
  }
}

/**
 * Update the URL without causing a page reload
 */
function updateUrl(urlParams: URLSearchParams, currentUrl: URL): void {
  const newSearch = urlParams.toString();
  const newUrl = newSearch 
    ? `${currentUrl.pathname}?${newSearch}${currentUrl.hash}`
    : `${currentUrl.pathname}${currentUrl.hash}`;
  
  // Use replaceState to avoid adding to browser history
  window.history.replaceState({}, '', newUrl);
}

