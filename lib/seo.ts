import type { Metadata } from 'next';
import { siteOrigin } from './site';

export const publicRoutes = ['/', '/imposter-game-generator/', '/imposter-game-rules/', '/imposter-game-words/'];

export const defaultOgImage = '/og/laughtable-imposter.svg';

export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = new URL(path, siteOrigin).href;
  const image = new URL(defaultOgImage, siteOrigin).href;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url, type: 'website', images: [{ url: image, width: 1200, height: 630, alt: 'Laugh Table Imposter secret word party game' }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}
