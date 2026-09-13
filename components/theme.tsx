'use client';
import { useEffect } from 'react';
import type { Category } from '@/lib/words';
import { themeFor } from '@/lib/themes';

// Puts the pack's theme on <html> (so the page background and every fixed overlay follow it) for as
// long as the component that chose it is mounted, and clears it on the way out.
export function useTheme(category: Category | null | undefined) {
  const id = themeFor(category)?.id ?? null;
  useEffect(() => {
    const root = document.documentElement;
    if (id) root.dataset.theme = id; else delete root.dataset.theme;
    return () => { delete root.dataset.theme; };
  }, [id]);
}
export default function PackTheme({ category }: { category: Category }) { useTheme(category); return null; }
