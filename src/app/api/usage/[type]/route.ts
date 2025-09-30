import { NextRequest, NextResponse } from 'next/server'
import { getUsage, incrementUsage, type UsageType } from '@/lib/usage'
import { incrementDailyCounter, incrementDailyZSet } from '@/lib/redis'

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const type = params.type as UsageType
  
  if (type !== 'alert' && type !== 'csv') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }
  
  try {
    const usage = await getUsage(type)
    return NextResponse.json(usage)
  } catch (error) {
    console.error('Error getting usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const type = params.type as UsageType
  
  if (type !== 'alert' && type !== 'csv') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }
  
  try {
    // Check current usage first
    const currentUsage = await getUsage(type)
    
    if (currentUsage.remaining === 0) {
      return NextResponse.json(
        { reason: 'limit', message: 'Usage limit reached' },
        { status: 403 }
      )
    }
    
    // Increment usage
    const updatedUsage = await incrementUsage(type)
    
    // Increment metrics counters for CSV exports
    if (type === 'csv') {
      try {
        await Promise.all([
          incrementDailyCounter('csv_exported'),
          incrementDailyZSet('csv_exported')
        ]);
      } catch (metricsError) {
        console.error('Failed to increment CSV metrics:', metricsError);
        // Don't fail the request if metrics fail
      }
    }
    
    return NextResponse.json(updatedUsage)
  } catch (error) {
    console.error('Error incrementing usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
