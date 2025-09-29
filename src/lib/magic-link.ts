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

  // Handle actradar parameter
  const actradarParam = urlParams.get('actradar');
  if (actradarParam === 'on') {
    setFlag('actradar', true);
    // Remove the parameter from URL
    urlParams.delete('actradar');
    updateUrl(urlParams, currentUrl);
  } else if (actradarParam === 'off') {
    setFlag('actradar', false);
    // Remove the parameter from URL
    urlParams.delete('actradar');
    updateUrl(urlParams, currentUrl);
  }

  // Handle other feature flags if needed in the future
  const alertsParam = urlParams.get('alerts');
  if (alertsParam === 'on') {
    setFlag('alerts', true);
    urlParams.delete('alerts');
    updateUrl(urlParams, currentUrl);
  } else if (alertsParam === 'off') {
    setFlag('alerts', false);
    urlParams.delete('alerts');
    updateUrl(urlParams, currentUrl);
  }

  const csvParam = urlParams.get('csv');
  if (csvParam === 'on') {
    setFlag('csv', true);
    urlParams.delete('csv');
    updateUrl(urlParams, currentUrl);
  } else if (csvParam === 'off') {
    setFlag('csv', false);
    urlParams.delete('csv');
    updateUrl(urlParams, currentUrl);
  }

  const changesParam = urlParams.get('changes');
  if (changesParam === 'on') {
    setFlag('changes', true);
    urlParams.delete('changes');
    updateUrl(urlParams, currentUrl);
  } else if (changesParam === 'off') {
    setFlag('changes', false);
    urlParams.delete('changes');
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
