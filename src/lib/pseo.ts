import { Metadata } from 'next'

// Types for pSEO entities
export interface EARChange {
  type: string
  title: string
  date: string
  topic: string
  link: string
}

export interface EARBundle {
  week: string
  items: EARChange[]
  generatedAt?: string
  sources?: string[]
}

export interface MEPStats {
  byId: Record<string, {
    id: string
    name?: string
    attendance?: number
    country?: string
    party?: string
    votesCast?: number
    totalVotes?: number
  }>
  leaderboard: Array<{
    id: string
    name?: string
    attendance?: number
    country?: string
    party?: string
  }>
  generatedAt?: string
  sources?: string[]
}

// Data fetchers
export async function getEARBundle(): Promise<EARBundle | null> {
  try {
    const response = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/ai-act/changes`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.warn('Failed to fetch EAR bundle:', response.status)
      return null
    }
    
    const data = await response.json()
    return data as EARBundle
  } catch (error) {
    console.warn('Error fetching EAR bundle:', error)
    return null
  }
}

export async function getMEPStats(): Promise<MEPStats | null> {
  try {
    // Try admin endpoint first (requires secret)
    const adminSecret = process.env.ADMIN_SECRET
    if (adminSecret) {
      const response = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/admin/mep-stats?key=${adminSecret}`, {
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data = await response.json()
        // Transform admin stats to MEPStats format
        return {
          byId: {},
          leaderboard: [],
          generatedAt: data.generated_at,
          sources: ['admin-api']
        }
      }
    }
    
    // Fallback to public API or KV
    const response = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/leaderboard`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.warn('Failed to fetch MEP stats:', response.status)
      return null
    }
    
    const data = await response.json()
    return {
      byId: {},
      leaderboard: data.rows || [],
      generatedAt: new Date().toISOString(),
      sources: ['public-api']
    }
  } catch (error) {
    console.warn('Error fetching MEP stats:', error)
    return null
  }
}

// Quality gates
export interface GateOptions {
  minItems: number
  minWords: number
  wordsCount: number
  itemsCount: number
}

export function canIndex({ minItems, minWords, wordsCount, itemsCount }: GateOptions): boolean {
  return itemsCount >= minItems && wordsCount >= minWords
}

// Utility functions
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export function makeMeta({ title, desc, canonical }: { title: string; desc: string; canonical?: string }): Metadata {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000'
  
  return {
    title,
    description: desc,
    canonical: canonical ? `${baseUrl}${canonical}` : undefined,
    openGraph: {
      title,
      description: desc,
      type: 'website',
      url: canonical ? `${baseUrl}${canonical}` : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
    },
  }
}

// Environment helpers
export function isPSEOEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PSEO_ENABLE === 'true'
}

export function getPSEOLimits() {
  return {
    minItems: parseInt(process.env.PSEO_MIN_ITEMS || '3'),
    minWords: parseInt(process.env.PSEO_MIN_WORDS || '160')
  }
}

// Logging helper
export function logPSEOGate(page: string, reason: string, details: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[pSEO Gate] ${page}: ${reason}`, details)
  }
}


