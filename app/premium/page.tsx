import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import PremiumPage from '@/components/premium/premium-page';

const title = 'Imposter Premium - More Players, More Packs';
const description = 'Unlock premium Imposter features after Stripe payment: premium word packs, custom packs, classroom mode, branded rooms, more players, history, and printable cards.';

export const metadata: Metadata = pageMetadata('/premium/', title, description);

export default function Page() { return <PremiumPage />; }
