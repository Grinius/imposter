import { describe, expect, it } from 'vitest';
import { playerCanAct, playerCanStart, publicRoom, roomIdIsValid, type PublicRoom } from '../lib/online';
const room: PublicRoom = { roomId: 'ABC123', hostId: 'host', status: 'lobby', round: 0, players: [{ id: 'host', name: 'Alex', connected: true, isHost: true }, { id: 'guest', name: 'Jamie', connected: true, isHost: false }] };
describe('online room protocol helpers', () => {
  it('accepts only six-character uppercase room identifiers', () => { expect(roomIdIsValid('ABC123')).toBe(true); expect(roomIdIsValid('abc123')).toBe(false); expect(roomIdIsValid('ABC12')).toBe(false); expect(roomIdIsValid('ABC1234')).toBe(false); });
  it('allows only the host to start a lobby with three players', () => { const full = { ...room, players: [...room.players, { id: 'third', name: 'Taylor', connected: true, isHost: false }] }; expect(playerCanStart(room, 'host')).toBe(false); expect(playerCanStart(full, 'host')).toBe(true); expect(playerCanStart(full, 'guest')).toBe(false); });
  it('requires an active connected membership for actions', () => { expect(playerCanAct(room, 'host')).toBe(true); expect(playerCanAct({ ...room, players: room.players.map(player => player.id === 'guest' ? { ...player, connected: false } : player) }, 'guest')).toBe(false); expect(playerCanAct(room, 'unknown')).toBe(false); });
  it('projects only public room fields and no secret role data', () => { const projection = publicRoom(room); expect(projection).toEqual(room); expect(JSON.stringify(projection)).not.toContain('word'); expect(JSON.stringify(projection)).not.toContain('imposter'); });
});
