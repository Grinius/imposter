'use client';
import { useSyncExternalStore } from 'react';

// A value that only exists in the browser (a query parameter, localStorage, a navigator feature),
// read without a hydration mismatch: the server snapshot renders first and React re-renders with
// the client value once hydrated. Prefer this over reading `window` in a useState initializer, which
// makes the first client render disagree with the HTML and logs React #418 on every such page.
const subscribe = () => () => {};
export function useClientValue<T>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(subscribe, read, () => serverValue);
}
