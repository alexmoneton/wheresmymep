/**
 * Caching and rate limiting for WhoFunds ETL
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = path.join(process.cwd(), '.cache/whofunds');

interface CacheEntry {
  url: string;
  contentHash: string;
  lastFetchedUTC: string;
  content?: string;
}

/**
 * Ensure cache directory exists
 */
export async function ensureCacheDir(): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

/**
 * Get cache file path for a URL
 */
function getCacheFilePath(url: string): string {
  const hash = crypto.createHash('md5').update(url).digest('hex');
  return path.join(CACHE_DIR, `${hash}.json`);
}

/**
 * Get cached content for URL
 */
export async function getCached(url: string): Promise<CacheEntry | null> {
  try {
    const filePath = getCacheFilePath(url);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Save content to cache
 */
export async function saveToCache(url: string, content: string): Promise<void> {
  await ensureCacheDir();
  
  const contentHash = crypto.createHash('sha256').update(content).digest('hex');
  const entry: CacheEntry = {
    url,
    contentHash,
    lastFetchedUTC: new Date().toISOString(),
    content
  };
  
  const filePath = getCacheFilePath(url);
  await fs.writeFile(filePath, JSON.stringify(entry, null, 2));
}

/**
 * Check if cached content is still fresh
 */
export function isCacheFresh(entry: CacheEntry, maxAgeHours: number = 24): boolean {
  const lastFetched = new Date(entry.lastFetchedUTC);
  const now = new Date();
  const ageHours = (now.getTime() - lastFetched.getTime()) / (1000 * 60 * 60);
  return ageHours < maxAgeHours;
}

/**
 * Compute content hash
 */
export function computeHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Rate limiting with delay
 */
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Rate-limited fetch with retry
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  delayMs: number = 2000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Add delay before request (respect rate limit)
      if (i > 0) {
        await delay(delayMs * (i + 1)); // Exponential backoff
      }
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'WheresMyMEP/1.0 (Research Tool; +https://wheresmymep.eu)',
          ...options.headers
        }
      });
      
      if (response.ok) {
        return response;
      }
      
      if (response.status === 429) {
        // Rate limited, wait longer
        await delay(delayMs * 2);
        continue;
      }
      
      if (response.status >= 500) {
        // Server error, retry
        lastError = new Error(`Server error: ${response.status}`);
        continue;
      }
      
      // Client error, don't retry
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      lastError = error as Error;
      if (i === maxRetries - 1) break;
    }
  }
  
  throw lastError || new Error('Fetch failed');
}

/**
 * Get metadata cache entry
 */
export async function getMetadata(mepId: string): Promise<any> {
  try {
    const metaPath = path.join(CACHE_DIR, `${mepId}.meta.json`);
    const content = await fs.readFile(metaPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Save metadata cache entry
 */
export async function saveMetadata(mepId: string, data: any): Promise<void> {
  await ensureCacheDir();
  const metaPath = path.join(CACHE_DIR, `${mepId}.meta.json`);
  await fs.writeFile(metaPath, JSON.stringify(data, null, 2));
}
