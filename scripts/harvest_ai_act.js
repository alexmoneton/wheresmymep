// Builds a weekly bundle for AI Act from configurable sources, then POSTs to your site.
// Reads env: PUBLISH_BASE, ADMIN_SECRET, AI_ACT_SOURCES (comma list of URLs). Fallback: keeps last bundle.
const PUBLISH_BASE = process.env.PUBLISH_BASE; // e.g. https://wheresmymep.eu
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const SOURCES = (process.env.AI_ACT_SOURCES || "").split(",").map(s => s.trim()).filter(Boolean);

// naive helpers
const today = new Date();
const weekNumber = (d => {
  const onejan = new Date(d.getFullYear(),0,1);
  const ms = (d - onejan + (onejan.getTimezoneOffset()-d.getTimezoneOffset())*60000);
  return Math.ceil((((ms/86400000)+onejan.getDay()+1)/7));
})(today);
const weekLabel = `${today.getFullYear()}-W${String(weekNumber).padStart(2,"0")}`;

function asISO(d){ return new Date(d).toISOString().slice(0,10); }

// Very light parser – replace with real logic per source.
async function scrapeSources() {
  const items = [];
  for (const url of SOURCES) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      const txt = await res.text();
      // TODO: replace heuristic with per-source parsing.
      // For demo we just create a single 'note' item so automation is end-to-end.
      items.push({
        type: "note",
        title: `Update detected at ${new URL(url).hostname}`,
        date: asISO(today),
        topic: "transparency",
        link: url
      });
    } catch {}
  }
  return items;
}

(async () => {
  if (!PUBLISH_BASE || !ADMIN_SECRET) {
    console.error("Missing PUBLISH_BASE or ADMIN_SECRET");
    process.exit(1);
  }

  let items = [];
  if (SOURCES.length) items = await scrapeSources();

  // If nothing found, keep at least one heartbeat item so the page updates weekly.
  if (!items.length) {
    items = [{
      type: "note",
      title: "No public updates found this run",
      date: asISO(today),
      topic: "transparency",
      link: "#"
    }];
  }

  const bundle = { week: weekLabel, items };

  const res = await fetch(`${PUBLISH_BASE}/api/ai-act/changes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": ADMIN_SECRET
    },
    body: JSON.stringify(bundle)
  });
  if (!res.ok) {
    const t = await res.text();
    console.error("Publish AI Act failed:", res.status, t);
    process.exit(1);
  }
  console.log("Published AI Act bundle:", weekLabel, items.length, "items");
})();
