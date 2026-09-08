import OnlineGame from '@/components/online';

export const metadata = { title: 'Play Imposter Online — Private room', description: 'Create or join a private Imposter game room and play with friends online.', robots: { index: false, follow: false } };
export default function OnlinePage() { return <OnlineGame />; }
