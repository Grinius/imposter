export type PremiumFeatureId = 'premium-packs' | 'custom-packs' | 'classroom-family' | 'branded-rooms' | 'room-history' | 'more-players' | 'printable-packs';

export interface PremiumFeature {
  id: PremiumFeatureId;
  title: string;
  summary: string;
}

export const premiumFeatures: PremiumFeature[] = [
  { id: 'premium-packs', title: 'Premium word packs', summary: 'Harder party packs, kid-friendly packs, themed holidays, date night, classroom topics, and advanced bluffing sets.' },
  { id: 'custom-packs', title: 'Custom word packs', summary: 'Create your own private word lists for inside jokes, lessons, teams, trips, or recurring family game nights.' },
  { id: 'classroom-family', title: 'Classroom and family mode', summary: 'Cleaner word sets, simpler clues, calmer pacing, and options for kids, students, mixed ages, and group hosts.' },
  { id: 'branded-rooms', title: 'Branded private rooms', summary: 'Add a room name, host label, theme, and shareable branded invite for parties, classrooms, and events.' },
  { id: 'room-history', title: 'Longer room history', summary: 'Keep recent rounds, winners, votes, and replayable word history beyond the short free-room session.' },
  { id: 'more-players', title: 'More players', summary: 'Run bigger games with up to 20 suspects when everyone has their own device.' },
  { id: 'printable-packs', title: 'Printable cards and PDF packs', summary: 'Generate print-ready role cards, word lists, and party sheets for offline play.' },
];

export const freePlayerLimit = 12;
export const premiumPlayerLimit = 20;
export const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? '';
export const premiumConfigured = /^https:\/\/(buy\.stripe\.com|checkout\.stripe\.com)\//.test(stripePaymentLink);
