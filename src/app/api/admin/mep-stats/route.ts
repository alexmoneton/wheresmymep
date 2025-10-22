import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { revalidateTag } from "next/cache";

export const runtime = 'nodejs';

const KV_KEY = "meps:stats:v1";

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

  // Expect: { generatedAt: ISO, stats: { byId: Record<string, any>, leaderboard: any[] } }
  if (!body?.generatedAt || !body?.stats) {
    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }

  const ok = await kv.setJSON(KV_KEY, body);
  if (!ok) return NextResponse.json({ error: "kv-write-failed" }, { status: 500 });

  // Revalidate tags used by leaderboard/home
  try {
    revalidateTag("meps-stats");
    revalidateTag("leaderboard");
  } catch (error) {
    console.error('Revalidation error:', error);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  try {
    const data = await kv.getJSON(KV_KEY);
    if (!data) {
      return NextResponse.json({ error: "not-found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching MEP stats:', error);
    return NextResponse.json({ error: "internal-error" }, { status: 500 });
  }
}


