import type { Metadata } from 'next';
import OnlineGame from '@/components/online';
import { pageMetadata } from '@/lib/seo';

const title = 'Play Imposter Online — Private room';
const description = 'Create or join a private Imposter game room and play with friends online.';

export const metadata: Metadata = { ...pageMetadata('/online/', title, description), robots: { index: false, follow: false } };
export default function OnlinePage() { return <OnlineGame />; }
