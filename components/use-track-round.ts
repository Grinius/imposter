'use client';
import { useEffect, useRef } from 'react';
import { track, type Mode } from '@/lib/analytics';

// Fires round_end exactly once per finished round, however many times the result re-renders.
export function useTrackRoundEnd(round: { phase: string; winner: 'friends' | 'imposter' | null; reason: string | null } | null, mode: Mode, roundKey: string | number, enabled = true) {
  const fired = useRef<string | number | null>(null);
  useEffect(() => {
    if (!enabled || !round || round.phase !== 'result' || !round.winner || fired.current === roundKey) return;
    fired.current = roundKey; track({ name: 'round_end', mode, winner: round.winner, reason: round.reason ?? 'unknown' });
  }, [round, mode, roundKey, enabled]);
}
