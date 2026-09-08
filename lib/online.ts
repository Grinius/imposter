export type OnlinePlayer = { id: string; name: string; connected: boolean; isHost: boolean };

export type PublicRoom = {
  roomId: string;
  hostId: string;
  status: 'lobby' | 'playing' | 'finished';
  players: OnlinePlayer[];
  round: number;
  game?: PublicGame;
};

export type PublicGame = {
  phase: import('./game').Phase;
  cursor: number;
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

export function playerCanStart(room: PublicRoom, playerId: string) {
  return room.hostId === playerId && room.status === 'lobby' && room.players.length >= 3;
}

export function playerCanAct(room: PublicRoom, playerId: string) {
  return room.players.some(player => player.id === playerId && player.connected);
}

export function publicRoom(room: PublicRoom, game?: import('./game').Round | null): PublicRoom {
  return {
    roomId: room.roomId,
    hostId: room.hostId,
    status: room.status,
    round: room.round,
    players: room.players.map(({ id, name, connected, isHost }) => ({ id, name, connected, isHost })),
    ...(game ? { game: { phase: game.phase, cursor: game.cursor, clues: game.clues, votesSubmitted: game.votes.length, playerCount: game.names.length, accused: game.accused, winner: game.winner, reason: game.reason } } : {}),
  };
}
