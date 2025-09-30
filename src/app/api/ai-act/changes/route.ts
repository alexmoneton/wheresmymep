import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { kv } from '@/lib/kv'
import { revalidateTag } from 'next/cache'

export const runtime = 'nodejs'          // ensure fs works (not Edge)
export const dynamic = 'force-dynamic'   // no caching of route

const FALLBACK = {
  week: 'fallback',
  items: [
    { type: 'guidance',      title: 'New guideline on high-risk systems logging', date: '2025-09-24', link: '#', topic: 'logging' },
    { type: 'delegated_act', title: 'Draft delegated act on post-market monitoring', date: '2025-09-23', link: '#', topic: 'post-market-monitoring' },
    { type: 'obligation',    title: 'Clarified duty for providers (Article 16)', date: '2025-09-22', link: '#', topic: 'transparency' },
  ],
}

const KV_KEY = "ai-act:changes:v1";

export async function GET() {
  try {
    // First try to get from KV storage
    const kvData = await kv.getJSON(KV_KEY);
    if (kvData && Array.isArray(kvData.items) && kvData.items.length > 0) {
      return new NextResponse(JSON.stringify(kvData), {
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      })
    }
  } catch (_) {
    // ignore and try file fallback
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'ai-act', 'changes.sample.json')
    const file = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(file)
    if (data && Array.isArray(data.items) && data.items.length > 0) {
      return new NextResponse(JSON.stringify(data), {
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      })
    }
  } catch (_) {
    // ignore and return fallback
  }
  return new NextResponse(JSON.stringify(FALLBACK), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET || "";
  const provided = req.headers.get("x-admin-secret") || "";
  
  if (!adminSecret || provided !== adminSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: any;
  try { 
    body = await req.json(); 
  } catch { 
    return NextResponse.json({ error: "bad-json" }, { status: 400 }); 
  }

  // Expect: { week: string, items: Array<{type, title, date, link, topic}> }
  if (!body?.week || !Array.isArray(body?.items)) {
    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }

  const ok = await kv.setJSON(KV_KEY, body);
  if (!ok) return NextResponse.json({ error: "kv-write-failed" }, { status: 500 });

  // Revalidate tags
  try {
    revalidateTag("ai-act-changes");
  } catch (error) {
    console.error('Revalidation error:', error);
  }

  return NextResponse.json({ ok: true });
}
