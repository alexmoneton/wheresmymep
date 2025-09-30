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
    '/ai-act/what-changed',
  ],
  additionalPaths: async (config) => {
    const paths = [];
    
    try {
      // Only add pSEO pages if enabled
      const pseoEnabled = process.env.NEXT_PUBLIC_PSEO_ENABLE === 'true';
      
      if (pseoEnabled) {
        // Add AI Act Radar topic pages
        const aiActTopics = [
          'logging',
          'dataset-governance', 
          'post-market-monitoring',
          'transparency',
          'risk-management'
        ];
        
        for (const topic of aiActTopics) {
          paths.push({
            loc: `/ai-act/topics/${topic}`,
            lastmod: new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.7,
          });
        }
        
        // Add weekly pages (current week only for now)
        const currentWeek = `W${Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
        paths.push({
          loc: `/ai-act/updates/week/${currentWeek}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.6,
        });
        
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
      
      // Always add static AI Act pages
      const staticAiActPages = [
        '/ai-act',
        '/ai-act/pricing'
      ];
      
      for (const page of staticAiActPages) {
        paths.push({
          loc: page,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7,
        });
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
          '/ai-act/what-changed',
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
    
    if (path.startsWith('/ai-act/topics/')) {
      return {
        loc: path,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      };
    }
    
    if (path.startsWith('/ai-act/updates/week/')) {
      return {
        loc: path,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.6,
      };
    }
    
    if (path.startsWith('/ai-act/')) {
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


