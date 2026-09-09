import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site';
import { publicRoutes } from '@/lib/seo';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map(path => ({ url: new URL(path, siteOrigin).href }));
}
