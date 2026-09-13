// What this device has already dealt, so a group playing several rounds — or several nights — does
// not see the same word twice while the pack still has fresh ones. Ids only, never words. The rules
// modules take the list as an `exclude` argument and fall back to the full pack (minus the last
// word) once everything has been seen, so a long night on a small pack still gets a word.
export const wordHistoryKey = 'imposter-recent-words', questionHistoryKey = 'imposter-recent-questions';
export const wordHistoryCap = 150, questionHistoryCap = 40;
export interface HistoryStore { getItem(key: string): string | null; setItem(key: string, value: string): void; }
export function readHistory(key: string, store: HistoryStore | null = defaultStore()): string[] {
  try { const raw = store?.getItem(key); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []; } catch { return []; }
}
export function remember(key: string, id: string, cap: number, store: HistoryStore | null = defaultStore()) {
  const next = [...readHistory(key, store).filter(seen => seen !== id), id].slice(-cap);
  try { store?.setItem(key, JSON.stringify(next)); } catch { /* private mode: memory lasts for the tab only */ }
  return next;
}
function defaultStore(): HistoryStore | null { try { return typeof window === 'undefined' ? null : window.localStorage; } catch { return null; } }
export const recentWords = () => readHistory(wordHistoryKey), rememberWord = (id: string) => remember(wordHistoryKey, id, wordHistoryCap);
export const recentQuestions = () => readHistory(questionHistoryKey), rememberQuestion = (id: string) => remember(questionHistoryKey, id, questionHistoryCap);
