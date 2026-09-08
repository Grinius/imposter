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
const origin = process.env.SITE_URL;
export const metadata: Metadata = {
  title: 'Imposter — The secret-word party game',
  description: 'Play the free imposter word game with 3–12 friends on one phone. Discover secret roles, give clues, and catch the imposter. No account or download needed.',
  ...(origin ? { metadataBase: new URL(origin), alternates: { canonical: '/' } } : {}),
  robots: origin ? { index: true, follow: true } : { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: '#102b26', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
