/**
 * Source discovery constants and utilities
 * Multi-language support for finding declaration links
 */

export const DECLARATION_LINK_TEXTS = [
  // English
  'Declaration of financial interests',
  'Declaration of Members\' Financial Interests',
  'Financial interests',
  'Declaration',
  
  // French
  'Déclaration d\'intérêts financiers',
  'Déclaration des intérêts financiers',
  'Intérêts financiers',
  
  // German
  'Erklärung der finanziellen Interessen',
  'Finanzielle Interessen',
  
  // Spanish
  'Declaración de intereses financieros',
  
  // Italian
  'Dichiarazione degli interessi finanziari',
  
  // Generic patterns
  'financial',
  'interests',
  'declaration'
];

export const COMMON_DECLARATION_PATHS = [
  '/declaration',
  '/financial-interests',
  '/interests',
  '/documents/declaration'
];

/**
 * Check if a link text/href likely points to a declaration
 */
export function isLikelyDeclarationLink(text: string, href?: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerHref = href?.toLowerCase() || '';
  
  // Check text matches
  const textMatch = DECLARATION_LINK_TEXTS.some(pattern => 
    lowerText.includes(pattern.toLowerCase())
  );
  
  // Check href matches
  const hrefMatch = COMMON_DECLARATION_PATHS.some(path =>
    lowerHref.includes(path)
  );
  
  // Check for PDF/document indicators
  const isPDF = lowerHref.endsWith('.pdf') || lowerText.includes('pdf');
  const isDocument = lowerHref.includes('document') || lowerHref.includes('doc');
  
  return textMatch || (hrefMatch && (isPDF || isDocument));
}

/**
 * Score a link's likelihood of being a declaration (0-100)
 */
export function scoreDeclarationLink(text: string, href: string): number {
  let score = 0;
  
  const lowerText = text.toLowerCase();
  const lowerHref = href.toLowerCase();
  
  // Exact matches get high scores
  if (lowerText.includes('declaration') && lowerText.includes('financial')) {
    score += 50;
  } else if (lowerText.includes('declaration') || lowerText.includes('financial')) {
    score += 30;
  }
  
  // PDF gets bonus
  if (lowerHref.endsWith('.pdf')) {
    score += 20;
  }
  
  // Path indicators
  if (lowerHref.includes('/declaration')) {
    score += 15;
  }
  
  // Multilingual keywords
  if (lowerText.match(/(intérêts|interessen|intereses|interessi)/)) {
    score += 25;
  }
  
  return Math.min(score, 100);
}

/**
 * Extract declaration URL from MEP profile page HTML
 * EP uses pattern: /meps/en/{id}/{NAME}/declarations
 */
export function findDeclarationURL(html: string, baseURL: string): string | null {
  // First try: Look for "/declarations" link
  const declarationsPattern = /href=["']([^"']*\/declarations[^"']*)["']/i;
  const match = html.match(declarationsPattern);
  
  if (match) {
    let url = match[1];
    if (!url.startsWith('http')) {
      const base = new URL(baseURL);
      url = `${base.protocol}//${base.host}${url}`;
    }
    return url;
  }

  // Second try: Construct from MEP ID
  // EP pattern: /meps/en/{id}/{NAME}/declarations
  const mepIdMatch = baseURL.match(/\/meps\/[^/]+\/(\d+)/);
  if (mepIdMatch) {
    const mepId = mepIdMatch[1];
    // Try to extract name from URL
    const nameMatch = baseURL.match(/\/meps\/[^/]+\/\d+\/([^/]+)/);
    if (nameMatch) {
      const name = nameMatch[1];
      return `https://www.europarl.europa.eu/meps/en/${mepId}/${name}/declarations`;
    }
    // Fallback: try to find NAME in HTML
    const nameInHtml = html.match(/<title>([^<]+)<\/title>/i);
    if (nameInHtml) {
      const name = nameInHtml[1].split(/[|-]/)[0].trim().replace(/\s+/g, '_').toUpperCase();
      return `https://www.europarl.europa.eu/meps/en/${mepId}/${name}/declarations`;
    }
  }

  // Last resort: Generic search
  const urlPattern = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
  let genericMatch;
  let bestMatch: { url: string; score: number } | null = null;
  
  while ((genericMatch = urlPattern.exec(html)) !== null) {
    const [, href, text] = genericMatch;
    const score = scoreDeclarationLink(text, href);
    
    if (score > 40 && (!bestMatch || score > bestMatch.score)) {
      let absoluteURL = href;
      if (!href.startsWith('http')) {
        const base = new URL(baseURL);
        if (href.startsWith('/')) {
          absoluteURL = `${base.protocol}//${base.host}${href}`;
        } else {
          absoluteURL = `${base.protocol}//${base.host}${base.pathname}${href}`;
        }
      }
      
      bestMatch = { url: absoluteURL, score };
    }
  }
  
  return bestMatch?.url || null;
}
