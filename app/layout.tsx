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
export const metadata: Metadata = {
  title: 'Imposter — The secret-word party game',
  description: 'Play the free imposter word game with 3–12 friends on one phone. Discover secret roles, give clues, and catch the imposter. No account or download needed.',
  metadataBase: new URL(siteOrigin),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: '#102b26', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
