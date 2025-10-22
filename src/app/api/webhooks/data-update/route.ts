import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// Webhook endpoint for external data sources to trigger immediate updates
export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const providedSecret = req.headers.get('x-webhook-secret');
    
    if (!webhookSecret || providedSecret !== webhookSecret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { source, dataType, timestamp } = body;
    
    // Log the webhook trigger
    console.log(`Webhook triggered: ${source} - ${dataType} at ${timestamp}`);
    
    // Store webhook metadata
    const webhookData = {
      source,
      dataType,
      timestamp,
      receivedAt: new Date().toISOString(),
      triggerId: `webhook_${Date.now()}`
    };
    
    await kv.setJSON('webhook:last_trigger', webhookData);
    
    // Revalidate relevant cache tags based on data type
    try {
      switch (dataType) {
        case 'mep_votes':
        case 'attendance':
          revalidateTag('meps-stats');
          revalidateTag('leaderboard');
          break;
        case 'ai_act':
          revalidateTag('ai-act-changes');
          break;
        case 'all':
          revalidateTag('meps-stats');
          revalidateTag('leaderboard');
          revalidateTag('ai-act-changes');
          break;
      }
    } catch (error) {
      console.error('Revalidation error:', error);
    }
    
    // Trigger background data refresh if needed
    if (dataType === 'mep_votes' || dataType === 'attendance' || dataType === 'all') {
      // In a real implementation, you might trigger a background job here
      // For now, we'll just log that a refresh should happen
      console.log('Background MEP data refresh should be triggered');
    }
    
    return NextResponse.json({ 
      ok: true, 
      message: 'Webhook processed successfully',
      triggerId: webhookData.triggerId
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check webhook status
export async function GET() {
  try {
    const lastTrigger = await kv.getJSON('webhook:last_trigger');
    
    return NextResponse.json({
      ok: true,
      lastTrigger: lastTrigger || null,
      status: 'webhook endpoint active'
    });
  } catch (error) {
    console.error('Error fetching webhook status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


