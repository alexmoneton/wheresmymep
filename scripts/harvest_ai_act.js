// Enhanced AI Act harvester that scrapes real EU sources for AI Act updates
// Reads env: PUBLISH_BASE, ADMIN_SECRET, AI_ACT_SOURCES (comma list of URLs). Fallback: keeps last bundle.
const PUBLISH_BASE = process.env.PUBLISH_BASE; // e.g. https://wheresmymep.eu
const ADMIN_SECRET = process.env.ADMIN_SECRET;
const SOURCES = (process.env.AI_ACT_SOURCES || "").split(",").map(s => s.trim()).filter(Boolean);

// Default AI Act sources if none provided - using RSS feeds for better data
const DEFAULT_SOURCES = [
  'https://www.europarl.europa.eu/thinktank/en/rss.xml', // EP Think Tank RSS
  'https://digital-strategy.ec.europa.eu/en/rss.xml', // EC Digital Strategy RSS
  'https://www.europarl.europa.eu/news/en/rss.xml', // EP News RSS
  'https://www.europarl.europa.eu/plenary/en/votes.xml' // EP votes feed
];

const ALL_SOURCES = SOURCES.length > 0 ? SOURCES : DEFAULT_SOURCES;

// Helper functions
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
}

const today = new Date();
const weekNumber = (d => {
  const onejan = new Date(d.getFullYear(),0,1);
  const ms = (d - onejan + (onejan.getTimezoneOffset()-d.getTimezoneOffset())*60000);
  return Math.ceil((((ms/86400000)+onejan.getDay()+1)/7));
})(today);
const weekLabel = `${today.getFullYear()}-W${String(weekNumber).padStart(2,"0")}`;

function asISO(d){ return new Date(d).toISOString().slice(0,10); }

// Enhanced parser for different source types
async function scrapeSources() {
  const items = [];
  
  for (const url of ALL_SOURCES) {
    try {
      log(`Scraping ${url}...`);
      const res = await fetch(url, { 
        cache: "no-store",
        headers: {
          'User-Agent': 'Where\'s My MEP AI Act Harvester (+https://wheresmymep.eu)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      
      if (!res.ok) {
        log(`Failed to fetch ${url}: ${res.status}`, 'warn');
        continue;
      }
      
      const content = await res.text();
      const parsedItems = parseSourceContent(url, content);
      items.push(...parsedItems);
      
      log(`Found ${parsedItems.length} items from ${url}`);
      
    } catch (error) {
      log(`Error scraping ${url}: ${error.message}`, 'warn');
    }
  }
  
  return items;
}

function parseRSSContent(url, xmlContent) {
  const items = [];
  const hostname = new URL(url).hostname;
  
  // Simple RSS parsing - extract items
  const itemRegex = /<item[^>]*>(.*?)<\/item>/gis;
  const titleRegex = /<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i;
  const linkRegex = /<link[^>]*>(.*?)<\/link>/i;
  const pubDateRegex = /<pubDate[^>]*>(.*?)<\/pubDate>/i;
  const descriptionRegex = /<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i;
  
  let itemMatch;
  while ((itemMatch = itemRegex.exec(xmlContent)) !== null) {
    const itemContent = itemMatch[1];
    
    const titleMatch = itemContent.match(titleRegex);
    const linkMatch = itemContent.match(linkRegex);
    const pubDateMatch = itemContent.match(pubDateRegex);
    const descMatch = itemContent.match(descriptionRegex);
    
    if (titleMatch && linkMatch) {
      const title = (titleMatch[1] || titleMatch[2] || '').trim();
      const link = linkMatch[1].trim();
      const description = descMatch ? (descMatch[1] || descMatch[2] || '').trim() : '';
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : asISO(today);
      
      // Check if it's AI Act related
      const isAIAct = title.toLowerCase().includes('ai act') || 
                     title.toLowerCase().includes('artificial intelligence') ||
                     description.toLowerCase().includes('ai act') ||
                     description.toLowerCase().includes('artificial intelligence');
      
      if (isAIAct) {
        items.push({
          type: "guidance",
          title: title,
          date: pubDate,
          topic: "ai-act",
          link: link
        });
      }
    }
  }
  
  // If no AI Act items found, create a general update
  if (items.length === 0) {
    items.push({
      type: "note",
      title: `EU updates from ${hostname}`,
      date: asISO(today),
      topic: "transparency",
      link: url
    });
  }
  
  return items;
}

function parseSourceContent(url, content) {
  const items = [];
  const hostname = new URL(url).hostname;
  
  // Check if it's an RSS feed
  if (url.includes('.xml') || content.includes('<rss') || content.includes('<feed')) {
    return parseRSSContent(url, content);
  }
  
  // HTML parsing for regular web pages
  const titleRegex = /<title[^>]*>([^<]+)<\/title>/i;
  const h1Regex = /<h1[^>]*>([^<]+)<\/h1>/gi;
  const h2Regex = /<h2[^>]*>([^<]+)<\/h2>/gi;
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
  
  // Extract main title
  const titleMatch = content.match(titleRegex);
  if (titleMatch) {
    const title = titleMatch[1].trim();
    if (title.toLowerCase().includes('ai act') || title.toLowerCase().includes('artificial intelligence')) {
      items.push({
        type: "guidance",
        title: title,
        date: asISO(today),
        topic: "ai-act",
        link: url
      });
    }
  }
  
  // Extract headings
  let headingMatch;
  while ((headingMatch = h1Regex.exec(content)) !== null) {
    const heading = headingMatch[1].trim();
    if (heading.toLowerCase().includes('ai act') || heading.toLowerCase().includes('artificial intelligence')) {
      items.push({
        type: "guidance",
        title: heading,
        date: asISO(today),
        topic: "ai-act",
        link: url
      });
    }
  }
  
  while ((headingMatch = h2Regex.exec(content)) !== null) {
    const heading = headingMatch[1].trim();
    if (heading.toLowerCase().includes('ai act') || heading.toLowerCase().includes('artificial intelligence')) {
      items.push({
        type: "note",
        title: heading,
        date: asISO(today),
        topic: "ai-act",
        link: url
      });
    }
  }
  
  // Extract relevant links
  let linkMatch;
  while ((linkMatch = linkRegex.exec(content)) !== null) {
    const [fullMatch, href, text] = linkMatch;
    const linkText = text.trim();
    
    if (linkText.toLowerCase().includes('ai act') || 
        linkText.toLowerCase().includes('artificial intelligence') ||
        linkText.toLowerCase().includes('delegated act') ||
        linkText.toLowerCase().includes('guidance')) {
      
      const fullUrl = href.startsWith('http') ? href : new URL(href, url).href;
      
      items.push({
        type: "note",
        title: linkText,
        date: asISO(today),
        topic: "ai-act",
        link: fullUrl
      });
    }
  }
  
  // If no specific AI Act content found, create a general update
  if (items.length === 0) {
    items.push({
      type: "note",
      title: `EU Parliament update from ${hostname}`,
      date: asISO(today),
      topic: "transparency",
      link: url
    });
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
