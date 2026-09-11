'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, Eye, LoaderCircle, ShieldAlert } from 'lucide-react';
import { storePremiumToken } from '@/lib/premium-client';
import BrandWordmark from '@/components/brand';

type VerifyState = 'missing' | 'verifying' | 'success' | 'error';

export default function PremiumSuccess() {
  const [state, setState] = useState<VerifyState>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!sessionId) { setState('missing'); return; }
    let cancelled = false;
    fetch('/api/premium/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) })
      .then(async response => {
        const data = await response.json() as { token?: string; error?: string };
        if (cancelled) return;
        if (!response.ok || !data.token) { setState('error'); setMessage(data.error ?? 'That payment could not be verified.'); return; }
        storePremiumToken(data.token);
        setState('success');
      })
      .catch(() => { if (!cancelled) { setState('error'); setMessage('Could not reach the server to verify this payment.'); } });
    return () => { cancelled = true; };
  }, []);

  return <div className="content-page premium-page">
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Imposter home"><span className="emblem emblem-small" aria-hidden="true"><Eye strokeWidth={1.25} /></span><BrandWordmark /></Link>
    </header>
    <main>
      <section className="content-hero">
        {state === 'verifying' && <><span className="eyebrow"><LoaderCircle size={14} className="spin" /> CHECKING YOUR PAYMENT</span><h1>One moment.</h1><p>Confirming your payment with Stripe.</p></>}
        {state === 'success' && <><span className="eyebrow"><Check size={14} /> PREMIUM UNLOCKED</span><h1>You&rsquo;re premium.</h1><p>This browser now has premium access — bigger games (up to 20 players) are unlocked right away; the rest of the premium pack unlocks here as it ships.</p><div><Link className="gold-button" href="/">Start playing <ArrowRight size={17} /></Link><Link className="outline-button" href="/premium/">See premium features</Link></div></>}
        {state === 'missing' && <><span className="eyebrow"><ShieldAlert size={14} /> NOTHING TO VERIFY</span><h1>No payment found.</h1><p>This page confirms a Stripe payment, but no checkout session was given. If you just paid, use the link from your Stripe receipt.</p><div><Link className="outline-button" href="/premium/">Back to premium <ArrowRight size={17} /></Link></div></>}
        {state === 'error' && <><span className="eyebrow"><ShieldAlert size={14} /> COULDN&rsquo;T VERIFY THAT PAYMENT</span><h1>Something went wrong.</h1><p>{message} If you were charged and this keeps happening, contact support with your Stripe receipt.</p><div><Link className="outline-button" href="/premium/">Back to premium <ArrowRight size={17} /></Link></div></>}
      </section>
    </main>
  </div>;
}
