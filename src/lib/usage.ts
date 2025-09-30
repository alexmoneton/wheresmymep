import { cookies } from 'next/headers'
import { isProEAR } from './pro-ear'

export type UsageType = 'alert' | 'csv'

export interface UsageData {
  used: number
  limit: number
  remaining: number
  resetAt: string
  isPro?: boolean
}

interface UsageCookie {
  monthKey: string
  alerts: number
  csv: number
}

const getCurrentMonthKey = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}`
}

const getDefaultLimits = () => ({
  alerts: parseInt(process.env.NEXT_PUBLIC_FREE_LIMIT_ALERTS || '3'),
  csv: parseInt(process.env.NEXT_PUBLIC_FREE_LIMIT_CSV || '3')
})

export async function getUsage(type: UsageType): Promise<UsageData> {
  const cookieStore = await cookies()
  const usageCookie = cookieStore.get('wm_usage')
  
  const currentMonthKey = getCurrentMonthKey()
  const limits = getDefaultLimits()
  const isPro = isProEAR()
  
  let usage: UsageCookie
  
  if (usageCookie) {
    try {
      const parsed = JSON.parse(usageCookie.value) as UsageCookie
      // Reset if month changed
      if (parsed.monthKey !== currentMonthKey) {
        usage = { monthKey: currentMonthKey, alerts: 0, csv: 0 }
      } else {
        usage = parsed
      }
    } catch {
      usage = { monthKey: currentMonthKey, alerts: 0, csv: 0 }
    }
  } else {
    usage = { monthKey: currentMonthKey, alerts: 0, csv: 0 }
  }
  
  const used = type === 'alert' ? usage.alerts : usage.csv
  const limit = isPro ? Infinity : (type === 'alert' ? limits.alerts : limits.csv)
  const remaining = isPro ? Infinity : Math.max(0, limit - used)
  
  // Calculate next reset date (first day of next month)
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  nextMonth.setDate(1)
  nextMonth.setHours(0, 0, 0, 0)
  
  return {
    used,
    limit,
    remaining,
    resetAt: nextMonth.toISOString(),
    isPro
  }
}

export async function incrementUsage(type: UsageType): Promise<UsageData> {
  const cookieStore = await cookies()
  const usageCookie = cookieStore.get('wm_usage')
  
  const currentMonthKey = getCurrentMonthKey()
  const limits = getDefaultLimits()
  const isPro = isProEAR()
  
  let usage: UsageCookie
  
  if (usageCookie) {
    try {
      const parsed = JSON.parse(usageCookie.value) as UsageCookie
      // Reset if month changed
      if (parsed.monthKey !== currentMonthKey) {
        usage = { monthKey: currentMonthKey, alerts: 0, csv: 0 }
      } else {
        usage = parsed
      }
    } catch {
      usage = { monthKey: currentMonthKey, alerts: 0, csv: 0 }
    }
  } else {
    usage = { monthKey: currentMonthKey, alerts: 0, csv: 0 }
  }
  
  // Increment the appropriate counter
  if (type === 'alert') {
    usage.alerts += 1
  } else {
    usage.csv += 1
  }
  
  // Set the updated cookie
  const cookieValue = JSON.stringify(usage)
  cookieStore.set('wm_usage', cookieValue, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 31 // 31 days
  })
  
  const used = type === 'alert' ? usage.alerts : usage.csv
  const limit = isPro ? Infinity : (type === 'alert' ? limits.alerts : limits.csv)
  const remaining = isPro ? Infinity : Math.max(0, limit - used)
  
  // Calculate next reset date (first day of next month)
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  nextMonth.setDate(1)
  nextMonth.setHours(0, 0, 0, 0)
  
  return {
    used,
    limit,
    remaining,
    resetAt: nextMonth.toISOString(),
    isPro
  }
}
