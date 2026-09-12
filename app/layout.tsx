import type { Metadata, Viewport } from 'next';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import './globals.css';
import { siteOrigin } from '@/lib/site';
import { defaultOgImage, ogImageAlt, siteName, siteTitleSuffix } from '@/lib/seo';
import { plausibleInitSnippet } from '@/lib/analytics';
export const metadata: Metadata = {
  title: 'Imposter — The secret-word party game' + siteTitleSuffix,
  description: 'Play the free imposter word game with 3–20 friends, on one phone or online. Discover secret roles, give clues, and catch the imposter. No account or download needed.',
  metadataBase: new URL(siteOrigin),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: { title: 'Imposter — The secret-word party game', description: 'Play the free imposter word game with 3–20 friends, on one phone or online. No account or download needed.', url: siteOrigin, type: 'website', siteName, images: [{ url: defaultOgImage, width: 1200, height: 630, type: 'image/png', alt: ogImageAlt }] },
  twitter: { card: 'summary_large_image', images: [defaultOgImage] },
};
export const viewport: Viewport = { themeColor: '#102b26', width: 'device-width', initialScale: 1 };
// Plausible: cookieless, no consent banner, one script. The inline stub queues events fired before
// the script arrives and installs the transformRequest that strips room codes from pageview URLs
// (see lib/analytics.ts). Localhost is not captured by the script's own default.
const plausibleScriptSrc = 'https://plausible.io/js/pa-dWrOAoDbseqK7HIlH0QL6.js';
// Tells Google the site is called LaughTable: without it the result pages guessed "Imposter" from the
// wordmark and appended it to rewritten titles.
const websiteJsonLd = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: siteName, alternateName: ['Imposter by LaughTable', 'Laugh Table'], url: `${siteOrigin}/` });
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><script async src={plausibleScriptSrc} /><script dangerouslySetInnerHTML={{ __html: plausibleInitSnippet }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteJsonLd }} /></head><body>{children}</body></html>;
}
