import { minPlayerLimit } from './limits';

export type OnlinePlayer = { id: string; name: string; connected: boolean; isHost: boolean };

// A seat as the server stores it. `secret` is the credential that proves "I am this seat" on
// reconnect; `id` is only a public handle. They must stay separate: `id` is broadcast to every
// player in the room, so if it doubled as the credential (as it used to) anyone who saw the room
// list could re-join as someone else, kick them off, and be handed their private role and word.
export type RoomPlayer = OnlinePlayer & { secret: string };
export type RoomState = Omit<PublicRoom, 'players'> & { players: RoomPlayer[] };

export type PublicRoom = {
  roomId: string;
  hostId: string;
  status: 'lobby' | 'playing' | 'finished';
  players: OnlinePlayer[];
  round: number;
  premium: boolean;
  game?: PublicGame;
};

export type PublicGame = {
  phase: import('./game').Phase;
  cursor: number;
  cursorPlayerId: string;
  firstClue: number;
  clues: string[];
  votesSubmitted: number;
  playerCount: number;
  accused: number | null;
  winner: 'friends' | 'imposter' | null;
  reason: 'caught' | 'escaped' | 'tie' | 'guessed' | null;
};

export type PrivateRole = { round: number; role: 'friend' | 'imposter'; word?: string; hint?: string };

export function roomIdIsValid(roomId: string) {
  return /^[A-Z0-9]{6}$/.test(roomId);
}

// The invite is a plain query parameter rather than /online/CODE because the site is a static
// export: /online/ is one HTML file, and a path segment would need a Worker rewrite to reach it
// (and would 404 under plain `next dev`). The page reads the parameter on load and pre-fills the
// join form, so a pasted link lands the guest one tap from the lobby instead of on a blank form.
export const invitePath = '/online/';
export function inviteUrl(origin: string, roomId: string) {
  return `${origin}${invitePath}?room=${roomId}`;
}
export function roomIdFromSearch(search: string) {
  const code = (new URLSearchParams(search).get('room') ?? '').trim().toUpperCase();
  return roomIdIsValid(code) ? code : null;
}

export function playerCanStart(room: PublicRoom, playerId: string) {
  return room.hostId === playerId && room.status === 'lobby' && room.players.length >= minPlayerLimit;
}

export function playerCanAct(room: PublicRoom, playerId: string) {
  return room.players.some(player => player.id === playerId && player.connected);
}

// The only projection of room state that ever reaches a client. Seat secrets are dropped here by
// construction: players are rebuilt from an explicit four-field pick, never spread.
export function publicRoom(room: RoomState, game?: import('./game').Round | null): PublicRoom {
  return {
    roomId: room.roomId,
    hostId: room.hostId,
    status: room.status,
    round: room.round,
    premium: room.premium,
    players: room.players.map(({ id, name, connected, isHost }) => ({ id, name, connected, isHost })),
    ...(game ? { game: { phase: game.phase, cursor: game.cursor, cursorPlayerId: room.players[game.cursor]?.id ?? '', firstClue: game.firstClue, clues: game.clues, votesSubmitted: game.votes.length, playerCount: game.names.length, accused: game.accused, winner: game.winner, reason: game.reason } } : {}),
  };
}
