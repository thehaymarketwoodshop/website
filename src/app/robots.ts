import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thehaymarketwoodshop.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Admin tools, API routes, and private per-customer invoice links should never be indexed.
      disallow: ['/admin', '/api', '/invoice'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
