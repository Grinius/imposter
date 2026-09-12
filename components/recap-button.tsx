'use client';
import { useState } from 'react';
import { Check, ImageDown, Share2 } from 'lucide-react';
import { prefersShareSheet, saveRecap, type RecapData } from '@/lib/recap-card';
import { track, type Mode } from '@/lib/analytics';

export default function RecapButton({ data, mode }: { data: RecapData; mode: Mode }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [canShareFiles] = useState(() => prefersShareSheet());
  async function save() {
    setState('busy');
    try { const outcome = await saveRecap(data); track({ name: 'recap_save', mode, outcome }); setState(outcome === 'cancelled' ? 'idle' : 'done'); setTimeout(() => setState('idle'), 2500); }
    catch { setState('error'); }
  }
  return <button className="outline-button recap-button" onClick={save} disabled={state === 'busy'}>
    {state === 'done' ? <Check size={17} /> : canShareFiles ? <Share2 size={17} /> : <ImageDown size={17} />}
    {state === 'busy' ? 'Making the recap…' : state === 'done' ? 'Recap ready' : state === 'error' ? 'Could not make the recap' : canShareFiles ? 'Share recap image' : 'Save recap image'}
  </button>;
}
