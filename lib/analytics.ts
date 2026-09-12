// Product analytics through Plausible (cookieless, no consent banner). The tag lives in
// app/layout.tsx; this module is the only place the game calls it, and it is deliberately narrow:
// an event is a name plus a small set of whitelisted, low-cardinality props. Player names, secret
// words, roles, clues, questions and room codes are never props — `track` drops any key that is not
// on the list, so a future call site cannot leak one by accident. Room codes are also stripped from
// the pageview URL in the tag's transformRequest.
export type Mode = 'word' | 'timer' | 'question' | 'drawing' | 'online';
export type AnalyticsEvent =
  | { name: 'round_start'; mode: Mode; pack?: string; players: number }
  | { name: 'round_end'; mode: Mode; winner: 'friends' | 'imposter'; reason: string }
  | { name: 'room_create' }
  | { name: 'room_join'; via: 'link' | 'code' }
  | { name: 'share_invite'; method: 'share' | 'copy' }
  | { name: 'reveal_tap'; mode: Mode }
  | { name: 'recap_save'; mode: Mode; outcome: 'shared' | 'downloaded' | 'cancelled' }
  | { name: 'paywall_shown'; reason: string };
const allowedProps = new Set(['mode', 'pack', 'players', 'winner', 'reason', 'via', 'method', 'outcome']);
type Plausible = (name: string, options?: { props?: Record<string, string | number> }) => void;
export function safeProps(event: Record<string, unknown>): Record<string, string | number> {
  const props: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(event)) {
    if (key === 'name' || !allowedProps.has(key)) continue;
    if (typeof value === 'number' && Number.isFinite(value)) props[key] = value;
    else if (typeof value === 'string' && value.length <= 40) props[key] = value;
  }
  return props;
}
export function track(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;
  const plausible = (window as Window & { plausible?: Plausible }).plausible;
  try { plausible?.(event.name, { props: safeProps(event) }); } catch { /* analytics must never break play */ }
}
// Strips a room code from a URL before it is sent as a pageview: `/online/?room=ABC123` locates a
// live room, and an analytics vendor has no business holding it.
export const roomParamPattern = /([?&])room=[^&#]*&?/i, danglingSeparatorPattern = /[?&](#|$)/;
export function scrubUrl(url: string) { return url.replace(roomParamPattern, '$1').replace(danglingSeparatorPattern, '$1'); }
// The same scrub as an inline snippet for the tag in app/layout.tsx, which runs before any bundle.
export const plausibleInitSnippet = `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init({transformRequest:function(r){if(r&&typeof r.u==='string'){r.u=r.u.replace(${String(roomParamPattern)},'$1').replace(${String(danglingSeparatorPattern)},'$1')}return r}})`;
