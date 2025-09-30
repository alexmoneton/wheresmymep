import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

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

export async function GET() {
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
