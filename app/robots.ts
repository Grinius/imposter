import type { MetadataRoute } from 'next';
export const dynamic = 'force-static';
export default function robots(): MetadataRoute.Robots {
  const origin = process.env.SITE_URL;
  return origin ? { rules: { userAgent: '*', allow: '/' }, sitemap: new URL('/sitemap.xml', origin).href } : { rules: { userAgent: '*', disallow: '/' } };
}
