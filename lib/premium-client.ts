'use client';
import { useEffect, useState } from 'react';

const TOKEN_KEY = 'imposter-premium-token';

export function getStoredPremiumToken(): string | null {
  return typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
}

export function storePremiumToken(token: string) {
  if (typeof window !== 'undefined') window.localStorage.setItem(TOKEN_KEY, token);
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
    fetch(`/api/premium/status?token=${encodeURIComponent(token)}`)
      .then(response => response.ok ? response.json() as Promise<{ premium?: boolean }> : { premium: false })
      .then(data => { if (!cancelled) { setPremium(!!data.premium); setChecked(true); } })
      .catch(() => { if (!cancelled) setChecked(true); });
    return () => { cancelled = true; };
  }, []);
  return { premium, checked };
}
