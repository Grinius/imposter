import type { Metadata } from 'next';
import { siteOrigin } from './site';
import { packs } from './packs';

export const publicRoutes = [
  '/',
  '/imposter-game-generator/',
  '/imposter-word-generator/',
  '/imposter-game-rules/',
  '/imposter-game-words/',
  '/imposter-game-categories/',
  '/imposter-game-online/',
  '/imposter-game-strategy/',
  '/timer-imposter/',
  '/question-imposter/',
  '/drawing-imposter/',
  '/packs/',
  ...packs.map(pack => `/packs/${pack.slug}/`),
  '/premium/',
  '/privacy/',
];

// PNG, not the SVG it is rendered from: chat apps and social networks do not unfurl SVG previews.
export const defaultOgImage = '/og/laughtable-imposter.png';
export const ogImageAlt = 'LaughTable — Imposter, the secret-word party game';
export const siteName = 'LaughTable';
export const siteTitleSuffix = ` | ${siteName}`;

export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = new URL(path, siteOrigin).href;
  const image = new URL(defaultOgImage, siteOrigin).href;
  return {
    title: title + siteTitleSuffix,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url, type: 'website', siteName, images: [{ url: image, width: 1200, height: 630, type: 'image/png', alt: ogImageAlt }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}
