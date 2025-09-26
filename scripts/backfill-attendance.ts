#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

type MEPJson = {
  mep_id: string;
  name: string;
  country: string;
  party?: string;
  votes_total_period?: number;
  votes_cast?: number;
};

async function main() {
  const prisma = new PrismaClient();
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'meps.json');
    const raw = readFileSync(jsonPath, 'utf8');
    const meps: MEPJson[] = JSON.parse(raw);

    let updated = 0;

    for (const row of meps) {
      const epId = String(row.mep_id || '').trim();
      if (!epId) continue;

      const votesTotal = Number(row.votes_total_period || 0);
      const votesCast = Number(row.votes_cast || 0);
      const attendancePct = votesTotal > 0 ? Math.round((votesCast / votesTotal) * 100) : null;

      try {
        // Try matching by epId as-is or with trailing .0 (from CSV float coercion)
        const epIdCandidates = [epId, `${epId}.0`];
        let res = await prisma.mEP.updateMany({
          where: { epId: { in: epIdCandidates } },
          data: {
            votesTotal,
            votesCast,
            attendancePct,
          },
        });
        if (res.count === 0) {
          // Fallback: match by slug derived from name
          const slug = row.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
          res = await prisma.mEP.updateMany({
            where: { slug },
            data: { votesTotal, votesCast, attendancePct },
          });
        }
        if (res.count > 0) updated += res.count;
      } catch (e) {
        // continue for robustness
      }
    }

    console.log(`Backfill complete. Updated ${updated} MEP records with attendance.`);
  } finally {
    // Always disconnect
    // eslint-disable-next-line no-process-exit
    await (prisma as any).$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


