import { freePlayerLimit, minPlayerLimit } from './limits';

// Rules every pass-and-play deduction variant shares. The variants (`timer-imposter`,
// `question-imposter`, `drawing-imposter`) keep their own explicit phase machines; only what is
// genuinely identical lives here, so a rule change in one game cannot silently leak into another.

export function validateNames(names: string[], maxPlayers = freePlayerLimit): string | null {
  if (names.length < minPlayerLimit || names.length > maxPlayers) return `Invite ${minPlayerLimit}–${maxPlayers} players to the table.`;
  const trimmed = names.map(name => name.trim());
  if (trimmed.some(name => !name || name.length > 20)) return 'Give everyone a name (up to 20 characters).';
  if (new Set(trimmed.map(name => name.toLocaleLowerCase())).size !== trimmed.length) return 'Use a different name for each player.';
  return null;
}

export function pick(length: number, random: () => number) {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Random value must be in [0, 1).');
  return Math.floor(value * length);
}

export function voteIsValid(target: unknown, voter: number, playerCount: number): target is number {
  return Number.isInteger(target) && (target as number) >= 0 && (target as number) < playerCount && target !== voter;
}

// The player with the most votes is accused; any tie is nobody, and nobody accused means the
// imposter slips through. Identical in every variant.
export function tally(votes: number[], playerCount: number): number | null {
  const counts = Array.from({ length: playerCount }, (_, i) => votes.filter(vote => vote === i).length);
  const top = Math.max(...counts);
  const leaders = counts.flatMap((count, i) => count === top ? [i] : []);
  return leaders.length === 1 ? leaders[0] : null;
}
