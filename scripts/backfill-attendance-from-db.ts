#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

type MEPJson = {
  mep_id: string;
  name: string;
  votes_total_period?: number;
  votes_cast?: number;
};

function toKeyFromDbEpId(dbEpId: string): string {
  // DB epId looks like "197400.0" → normalize to plain string "197400"
  const num = Number(dbEpId);
  return Number.isFinite(num) ? String(num) : dbEpId.replace(/\.0$/, '');
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'meps.json');
    const raw = readFileSync(jsonPath, 'utf8');
    const mepsJson: MEPJson[] = JSON.parse(raw);

    // Build lookup by normalized mep_id
    const jsonById = new Map<string, MEPJson>();
    for (const m of mepsJson) {
      const id = String(m.mep_id || '').trim();
      if (!id) continue;
      jsonById.set(String(Number(id)), m); // store numeric-string key
    }

    const meps = await prisma.mEP.findMany({ select: { id: true, epId: true } });
    let updated = 0;

    for (const mep of meps) {
      if (!mep.epId) continue;
      const key = toKeyFromDbEpId(mep.epId);
      const row = jsonById.get(key);
      if (!row) continue;

      const votesTotal = Number(row.votes_total_period || 0);
      const votesCast = Number(row.votes_cast || 0);
      const attendancePct = votesTotal > 0 ? Math.round((votesCast / votesTotal) * 100) : null;

      const res = await prisma.mEP.update({
        where: { id: mep.id },
        data: { votesTotal, votesCast, attendancePct },
      });
      if (res) updated += 1;
    }

    console.log(`Backfill complete. Updated ${updated}/${meps.length} MEPs.`);
  } finally {
    await (prisma as any).$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


