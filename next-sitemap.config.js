/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/admin/*',
    '/api/*',
    '/dashboard/*',
    '/pricing',
    '/api-keys',
    '/alerts',
    '/ai-act/*', // Exclude all AI Act Radar pages (decommissioned)
  ],
  additionalPaths: async (config) => {
    const paths = [];
    
    try {
      // Only add pSEO pages if enabled
      const pseoEnabled = process.env.NEXT_PUBLIC_PSEO_ENABLE === 'true';
      
      if (pseoEnabled) {
        // Add country pages (common EU countries)
        const countries = [
          'germany', 'france', 'italy', 'spain', 'poland', 'romania', 'netherlands',
          'belgium', 'greece', 'czech-republic', 'portugal', 'sweden', 'hungary',
          'austria', 'bulgaria', 'denmark', 'finland', 'slovakia', 'ireland',
          'croatia', 'lithuania', 'slovenia', 'latvia', 'estonia', 'cyprus',
          'luxembourg', 'malta'
        ];
        
        for (const country of countries) {
          paths.push({
            loc: `/country/${country}`,
            lastmod: new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.6,
          });
        }
        
        // Add party pages (major EU parties)
        const parties = [
          'european-peoples-party', 'progressive-alliance-of-socialists-and-democrats',
          'renew-europe', 'european-conservatives-and-reformists',
          'identity-and-democracy', 'the-left', 'greens-european-free-alliance'
        ];
        
        for (const party of parties) {
          paths.push({
            loc: `/party/${party}`,
            lastmod: new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.6,
          });
        }
      }
      
    } catch (error) {
      console.error('Error generating additional sitemap paths:', error);
    }
    
    return paths;
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/pricing',
          '/api-keys',
          '/alerts',
          '/ai-act/', // Disallow all AI Act Radar pages (decommissioned)
        ],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wheresmymep.eu'}/sitemap.xml`,
    ],
  },
  transform: async (config, path) => {
    // Custom transform for different page types
    if (path === '/') {
      return {
        loc: path,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0,
      };
    }
    
    if (path.startsWith('/mep/')) {
      return {
        loc: path,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
      };
    }
    
    if (path.startsWith('/country/')) {
      return {
        loc: path,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.6,
      };
    }
    
    if (path.startsWith('/party/')) {
      return {
        loc: path,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.6,
      };
    }
    
    if (path.startsWith('/votes/')) {
      return {
        loc: path,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.5,
      };
    }
    
    if (path.startsWith('/who-funds')) {
      return {
        loc: path,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      };
    }
    
    return {
      loc: path,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.5,
    };
  },
};


