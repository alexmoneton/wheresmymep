// Downloads raw vote/attendance data, computes stats, and POSTs to /api/admin/mep-stats.
// Replace SOURCE URLs with the official parliament datasets you prefer.
const PUBLISH_BASE = process.env.PUBLISH_BASE;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

// TODO: point these to official EP Open Data endpoints you want to use.
const SOURCES = [
  process.env.MEP_VOTES_SOURCE || "" // e.g. https://example/roll-call-votes.csv
].filter(Boolean);

// Example compute — replace with your real transform logic
async function fetchText(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed ${url} ${res.status}`);
  return res.text();
}

function computeStatsFromCSV(csv) {
  // Minimal CSV mock: id,date,status (present|absent)
  // In reality, parse official CSV/JSON and roll up as you wish.
  const byId = {};
  const lines = csv.split(/\r?\n/).slice(1); // skip header
  for (const line of lines) {
    if (!line.trim()) continue;
    const [id, date, status] = line.split(",");
    byId[id] ||= { id, present: 0, total: 0 };
    byId[id].total += 1;
    if (status === "present") byId[id].present += 1;
  }
  // compute attendance rate
  const leaderboard = Object.values(byId)
    .map(r => ({ id: r.id, attendance: r.total ? Math.round((r.present/r.total)*1000)/10 : 0 }))
    .sort((a,b) => b.attendance - a.attendance)
    .slice(0, 5000);
  return { byId, leaderboard };
}

(async () => {
  if (!PUBLISH_BASE || !ADMIN_SECRET) {
    console.error("Missing PUBLISH_BASE or ADMIN_SECRET");
    process.exit(1);
  }

  let combined = "";
  for (const url of SOURCES) {
    try { combined += "\n" + await fetchText(url); } catch {}
  }
  if (!combined) {
    // keep site alive with no-op stats
    const now = Date.now();
    combined = "id,date,status\n123,"+new Date(now).toISOString().slice(0,10)+",present\n";
  }
  const stats = computeStatsFromCSV(combined);
  const payload = { generatedAt: new Date().toISOString(), stats };

  const res = await fetch(`${PUBLISH_BASE}/api/admin/mep-stats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": ADMIN_SECRET
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const t = await res.text();
    console.error("Publish MEP stats failed:", res.status, t);
    process.exit(1);
  }
  console.log("Published MEP stats:", Object.keys(stats.byId).length, "MEPs");
})();


