export type OnlinePlayer = { id: string; name: string; connected: boolean; isHost: boolean };

export type PublicRoom = {
  roomId: string;
  hostId: string;
  status: 'lobby' | 'playing' | 'finished';
  players: OnlinePlayer[];
  round: number;
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

export function publicRoom(room: PublicRoom): PublicRoom {
  return {
    roomId: room.roomId,
    hostId: room.hostId,
    status: room.status,
    round: room.round,
    players: room.players.map(({ id, name, connected, isHost }) => ({ id, name, connected, isHost })),
  };
}
