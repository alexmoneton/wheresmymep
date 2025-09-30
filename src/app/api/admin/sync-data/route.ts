import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

// Admin endpoint to manually trigger data synchronization
export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET || "";
  const provided = req.headers.get("x-admin-secret") || "";
  
  if (!adminSecret || provided !== adminSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { dataType = 'all', force = false } = body;
    
    console.log(`Manual data sync triggered: ${dataType}, force: ${force}`);
    
    // Store sync request metadata
    const syncData = {
      dataType,
      force,
      triggeredAt: new Date().toISOString(),
      triggeredBy: 'admin',
      syncId: `sync_${Date.now()}`
    };
    
    await kv.setJSON('sync:last_request', syncData);
    
    // Revalidate cache tags
    try {
      switch (dataType) {
        case 'meps':
          revalidateTag('meps-stats');
          revalidateTag('leaderboard');
          break;
        case 'ai-act':
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
    
    // In a production environment, you might trigger background jobs here
    // For now, we'll return success and log the request
    
    return NextResponse.json({
      ok: true,
      message: `Data sync triggered for ${dataType}`,
      syncId: syncData.syncId,
      timestamp: syncData.triggeredAt
    });
    
  } catch (error) {
    console.error('Data sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status
export async function GET() {
  try {
    const lastSync = await kv.getJSON('sync:last_request');
    const lastWebhook = await kv.getJSON('webhook:last_trigger');
    
    return NextResponse.json({
      ok: true,
      lastSync: lastSync || null,
      lastWebhook: lastWebhook || null,
      status: 'sync endpoint active'
    });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
