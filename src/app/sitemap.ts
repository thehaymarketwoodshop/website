import type { MetadataRoute } from 'next';
import { fetchAllProducts } from '@/lib/shopifyClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thehaymarketwoodshop.com';

const staticRoutes = [
  '',
  '/about',
  '/products',
  '/custom-order',
  '/care-guide',
  '/woods',
  '/stain-samples',
  '/gallery',
  '/contact',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const products = await fetchAllProducts().catch(() => []);
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/products/${p.handle}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...productEntries];
}
