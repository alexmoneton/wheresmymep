import { NextRequest, NextResponse } from 'next/server'
import { getDailyStats } from '@/lib/redis'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Check admin secret
    const url = new URL(request.url)
    const key = url.searchParams.get('key')
    
    if (!key || key !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get stats for the last 7 and 30 days
    const [alerts7d, alerts30d, csv7d, csv30d, billing7d, billing30d] = await Promise.all([
      getDailyStats('alerts_created', 7),
      getDailyStats('alerts_created', 30),
      getDailyStats('csv_exported', 7),
      getDailyStats('csv_exported', 30),
      getDailyStats('billing_interest', 7),
      getDailyStats('billing_interest', 30),
    ])

    // Calculate totals
    const totals = {
      alerts_created: {
        last7days: alerts7d.reduce((sum, day) => sum + day.count, 0),
        last30days: alerts30d.reduce((sum, day) => sum + day.count, 0),
      },
      csv_exported: {
        last7days: csv7d.reduce((sum, day) => sum + day.count, 0),
        last30days: csv30d.reduce((sum, day) => sum + day.count, 0),
      },
      billing_interest: {
        last7days: billing7d.reduce((sum, day) => sum + day.count, 0),
        last30days: billing30d.reduce((sum, day) => sum + day.count, 0),
      },
    }

    return NextResponse.json({
      totals,
      daily: {
        alerts_created: {
          last7days: alerts7d,
          last30days: alerts30d,
        },
        csv_exported: {
          last7days: csv7d,
          last30days: csv30d,
        },
        billing_interest: {
          last7days: billing7d,
          last30days: billing30d,
        },
      },
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
