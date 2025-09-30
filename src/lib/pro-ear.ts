import { cookies } from 'next/headers'

/**
 * Check if user has EU Act Radar Pro subscription
 * Server-side helper that reads the pro_ear cookie
 */
export function isProEAR(): boolean {
  try {
    const cookieStore = cookies()
    const proEarCookie = cookieStore.get('pro_ear')
    return proEarCookie?.value === '1'
  } catch (error) {
    // If cookies() fails (e.g., in middleware), return false
    return false
  }
}

/**
 * Client-side helper to check pro status
 * This reads from document.cookie since we can't use server-side cookies in client components
 */
export function isProEARClient(): boolean {
  if (typeof document === 'undefined') return false
  
  try {
    const cookies = document.cookie.split(';')
    const proEarCookie = cookies.find(cookie => 
      cookie.trim().startsWith('pro_ear=')
    )
    return proEarCookie?.includes('pro_ear=1') || false
  } catch (error) {
    return false
  }
}

/**
 * Get the free limits for EU Act Radar features
 * Returns different limits based on pro status
 */
export function getEARLimits(isPro: boolean = false) {
  if (isPro) {
    return {
      alerts: Infinity,
      csv: Infinity,
      message: 'Pro features active'
    }
  }
  
  return {
    alerts: 3,
    csv: 3,
    message: 'Free plan: 3 alerts and 3 CSV exports per month'
  }
}
