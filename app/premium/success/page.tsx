import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import PremiumSuccess from '@/components/premium/success';

const title = 'Payment confirmed — Imposter Premium';
const description = 'Confirming your Imposter Premium payment.';

export const metadata: Metadata = { ...pageMetadata('/premium/success/', title, description), robots: { index: false, follow: false } };

export default function Page() { return <PremiumSuccess />; }
