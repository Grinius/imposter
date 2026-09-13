'use client';

import { useId, useState } from 'react';
import { Check, KeyRound, LoaderCircle } from 'lucide-react';
import { extractCheckoutSessionId } from '@/lib/premium';
import { verifyCheckoutSession } from '@/lib/premium-client';

// Lets a buyer unlock a second device, or one where the post-checkout tab was closed, by pasting
// the redirect URL or the `cs_…` session id from it. Stripe's receipt email carries neither, so
// this is the only self-serve path back; otherwise it's a support email.
export default function RestorePurchase({ onRestored }: { onRestored: () => void }) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const inputId = useId();
  const errorId = useId();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const sessionId = extractCheckoutSessionId(value);
    if (!sessionId) { setState('error'); setError('Paste the whole address of the page Stripe sent you to after paying — it contains an id starting with "cs_".'); return; }
    setState('verifying');
    const result = await verifyCheckoutSession(sessionId);
    if (result.ok) { setState('success'); onRestored(); return; }
    setState('error'); setError(result.error);
  }

  if (state === 'success') return <p className="restore-done"><Check size={15} /> Premium restored on this device.</p>;

  return <form className="restore-form" onSubmit={submit} aria-labelledby={`${inputId}-title`}>
    <h2 id={`${inputId}-title`}><KeyRound size={15} /> Already paid? Restore your purchase</h2>
    <p>Paste the address of the page Stripe sent you to after checkout (it contains an id starting with <code>cs_</code>). Each payment unlocks up to 5 devices.</p>
    <div>
      <label htmlFor={inputId} className="visually-hidden">Stripe checkout link or session id</label>
      <input id={inputId} value={value} onChange={event => { setValue(event.target.value); if (state === 'error') setState('idle'); }} placeholder="https://laughtable.com/premium/success/?session_id=cs_live_…" autoComplete="off" spellCheck={false} aria-invalid={state === 'error'} aria-describedby={state === 'error' ? errorId : undefined} disabled={state === 'verifying'} />
      <button className="outline-button" type="submit" disabled={state === 'verifying' || !value.trim()}>{state === 'verifying' ? <><LoaderCircle size={15} className="spin" /> Checking</> : 'Restore'}</button>
    </div>
    {state === 'error' && <p id={errorId} className="form-error" role="alert">{error}</p>}
  </form>;
}
