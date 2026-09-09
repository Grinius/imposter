import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/imposter-game-generator/'].map(path => ({ url: new URL(path, siteOrigin).href }));
}
