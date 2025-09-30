import { NextRequest, NextResponse } from 'next/server'
import { getUsage, incrementUsage, type UsageType } from '@/lib/usage'

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
    return NextResponse.json(updatedUsage)
  } catch (error) {
    console.error('Error incrementing usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
