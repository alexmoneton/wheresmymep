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
  ],
  additionalPaths: async (config) => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const paths = [];
    
    try {
      // Get all MEPs
      const meps = await prisma.mEP.findMany({
        select: { slug: true, firstName: true, lastName: true },
        where: { active: true }
      });
      
      for (const mep of meps) {
        paths.push({
          loc: `/meps/${mep.slug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.8,
        });
      }
      
      // Get all committees
      const committees = await prisma.committee.findMany({
        select: { slug: true, name: true }
      });
      
      for (const committee of committees) {
        paths.push({
          loc: `/committees/${committee.slug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7,
        });
      }
      
      // Get all dossiers
      const dossiers = await prisma.dossier.findMany({
        select: { slug: true, title: true }
      });
      
      for (const dossier of dossiers) {
        paths.push({
          loc: `/dossiers/${dossier.slug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.6,
        });
      }
      
      // Get all votes
      const votes = await prisma.vote.findMany({
        select: { id: true, title: true },
        take: 1000, // Limit to most recent 1000 votes
        orderBy: { date: 'desc' }
      });
      
      for (const vote of votes) {
        paths.push({
          loc: `/votes/${vote.id}`,
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.5,
        });
      }
      
      // Get all topics
      const topics = await prisma.topic.findMany({
        select: { slug: true, name: true }
      });
      
      for (const topic of topics) {
        paths.push({
          loc: `/topics/${topic.slug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.6,
        });
      }
      
      // Get all countries
      const countries = await prisma.country.findMany({
        select: { slug: true, name: true }
      });
      
      for (const country of countries) {
        paths.push({
          loc: `/meps/country/${country.slug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7,
        });
      }
      
      // Get all parties
      const parties = await prisma.party.findMany({
        select: { slug: true, name: true }
      });
      
      for (const party of parties) {
        paths.push({
          loc: `/meps/party/${party.slug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7,
        });
      }
      
      // Ranking pages
      const rankingPages = [
        'attendance',
        'most-active',
        'climate-environment',
        'energy',
        'migration-asylum',
        'digital-technology',
        'trade-economy',
        'agriculture',
        'health',
        'education-culture',
        'transport',
        'defense-security',
        'foreign-affairs',
        'human-rights',
        'democracy-rule-of-law',
        'justice-home-affairs',
      ];
      
      for (const ranking of rankingPages) {
        paths.push({
          loc: `/rankings/${ranking}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.6,
        });
      }
      
    } catch (error) {
      console.error('Error generating additional sitemap paths:', error);
    } finally {
      await prisma.$disconnect();
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
    
    if (path.startsWith('/meps/') && !path.includes('/country/') && !path.includes('/party/')) {
      return {
        loc: path,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
      };
    }
    
    if (path.startsWith('/committees/')) {
      return {
        loc: path,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      };
    }
    
    if (path.startsWith('/dossiers/')) {
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
    
    if (path.startsWith('/topics/')) {
      return {
        loc: path,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.6,
      };
    }
    
    if (path.startsWith('/rankings/')) {
      return {
        loc: path,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.6,
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


