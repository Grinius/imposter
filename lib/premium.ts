import { freePlayerLimit, premiumPlayerLimit } from './limits';
import { categories } from './words';
import type { Settings } from './game';
export type PremiumFeatureId = 'premium-packs' | 'custom-packs' | 'classroom-family' | 'branded-rooms' | 'room-history' | 'more-players' | 'printable-packs';

export interface PremiumFeature {
  id: PremiumFeatureId;
  title: string;
  summary: string;
}

export const premiumFeatures: PremiumFeature[] = [
  { id: 'premium-packs', title: 'Premium word packs', summary: 'Date night and Holidays & celebrations are ready now. Harder party packs, kid-friendly packs, classroom topics, and advanced bluffing sets are still on the way.' },
  { id: 'custom-packs', title: 'Custom word packs', summary: 'Create your own private word lists for inside jokes, lessons, teams, trips, or recurring family game nights.' },
  { id: 'classroom-family', title: 'Classroom and family mode', summary: 'Cleaner word sets, simpler clues, calmer pacing, and options for kids, students, mixed ages, and group hosts.' },
  { id: 'branded-rooms', title: 'Branded private rooms', summary: 'Add a room name, host label, theme, and shareable branded invite for parties, classrooms, and events.' },
  { id: 'room-history', title: 'Longer room history', summary: 'Keep recent rounds, winners, votes, and replayable word history beyond the short free-room session.' },
  { id: 'more-players', title: 'More players', summary: `Free games support up to ${freePlayerLimit} suspects. Premium will unlock bigger games with up to ${premiumPlayerLimit} suspects when everyone has their own device.` },
  { id: 'printable-packs', title: 'Printable cards and PDF packs', summary: 'Generate print-ready role cards, word lists, and party sheets for offline play.' },
];

export const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? '';
export const premiumConfigured = /^https:\/\/(buy\.stripe\.com|checkout\.stripe\.com)\//.test(stripePaymentLink);

// Human-readable reasons a chosen setup needs premium, for the "you picked premium things, here's
// what to do about it" prompt shown at start time rather than blocking selection up front.
export function describePremiumRequirements(settings: Settings): string[] {
  const reasons: string[] = [];
  if (settings.names.length > freePlayerLimit) reasons.push(`${settings.names.length} players (free games support up to ${freePlayerLimit})`);
  const category = categories.find(candidate => candidate.id === settings.category);
  if (category?.premium) reasons.push(`${category.name} category`);
  return reasons;
}
