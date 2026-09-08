import type { MetadataRoute } from 'next';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap { return process.env.SITE_URL ? [{ url: new URL('/', process.env.SITE_URL).href }] : []; }
