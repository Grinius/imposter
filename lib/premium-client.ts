'use client';
import { useEffect, useState } from 'react';

const TOKEN_KEY = 'imposter-premium-token';

export function getStoredPremiumToken(): string | null {
  return typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
}

export function storePremiumToken(token: string) {
  if (typeof window !== 'undefined') window.localStorage.setItem(TOKEN_KEY, token);
}

// Ask the Worker to confirm a Checkout session was paid and, if so, mint this browser's entitlement.
// Shared by the post-checkout success page and the "Restore purchase" form; the error text comes
// from the Worker so both surfaces explain a failure the same way.
export async function verifyCheckoutSession(sessionId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch('/api/premium/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) });
    const data = await response.json() as { token?: string; error?: string };
    if (!response.ok || !data.token) return { ok: false, error: data.error ?? 'That payment could not be verified.' };
    storePremiumToken(data.token);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not reach the server to verify this payment.' };
  }
}

// Verifies the stored token is still a legitimately signed, unexpired entitlement by asking the
// Worker (which holds the signing secret) rather than trusting anything read from localStorage on
// its own — a viewer could otherwise hand-edit their own "premium" flag in devtools.
export function usePremiumStatus() {
  const [premium, setPremium] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const token = getStoredPremiumToken();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!token) { setChecked(true); return; }
    let cancelled = false;
    // POST, not a query string: the token is a bearer credential and URLs end up in request logs.
    fetch('/api/premium/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(response => response.ok ? response.json() as Promise<{ premium?: boolean; token?: string }> : { premium: false, token: undefined })
      // Entitlements have a bounded life, and the Worker hands back a renewed token once one is
      // near the end of it. Storing it here is what keeps a device that keeps playing unlocked
      // indefinitely without ever going back through checkout.
      .then(data => { if (data.token) storePremiumToken(data.token); if (!cancelled) { setPremium(!!data.premium); setChecked(true); } })
      .catch(() => { if (!cancelled) setChecked(true); });
    return () => { cancelled = true; };
  }, []);
  // `markPremium` lets a page that has just verified a session (e.g. "Restore purchase") flip to the
  // unlocked state without a reload or a second round trip.
  return { premium, checked, markPremium: () => setPremium(true) };
}
