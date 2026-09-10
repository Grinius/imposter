import { describe, expect, it } from 'vitest';
import { playerCanAct, playerCanStart, publicRoom, roomIdIsValid, type PublicRoom, type RoomState } from '../lib/online';
import { createRound, transition } from '../lib/game';
// Stored room state carries each seat's secret; the public projection must never echo it back.
const room: RoomState = { roomId: 'ABC123', hostId: 'host', status: 'lobby', round: 0, premium: false, players: [{ id: 'host', secret: 'host-seat-secret', name: 'Alex', connected: true, isHost: true }, { id: 'guest', secret: 'guest-seat-secret', name: 'Jamie', connected: true, isHost: false }] };
describe('online room protocol helpers', () => {
  it('accepts only six-character uppercase room identifiers', () => { expect(roomIdIsValid('ABC123')).toBe(true); expect(roomIdIsValid('abc123')).toBe(false); expect(roomIdIsValid('ABC12')).toBe(false); expect(roomIdIsValid('ABC1234')).toBe(false); });
  it('allows only the host to start a lobby with three players', () => { const full: PublicRoom = { ...room, players: [...room.players, { id: 'third', name: 'Taylor', connected: true, isHost: false }] }; expect(playerCanStart(room, 'host')).toBe(false); expect(playerCanStart(full, 'host')).toBe(true); expect(playerCanStart(full, 'guest')).toBe(false); });
  it('requires an active connected membership for actions', () => { expect(playerCanAct(room, 'host')).toBe(true); expect(playerCanAct({ ...room, players: room.players.map(player => player.id === 'guest' ? { ...player, connected: false } : player) }, 'guest')).toBe(false); expect(playerCanAct(room, 'unknown')).toBe(false); });
  it('projects only public room fields and no secret role data', () => { const projection = publicRoom(room); expect(JSON.stringify(projection)).not.toContain('word'); expect(JSON.stringify(projection)).not.toContain('imposter'); });
  it('strips every seat secret out of the projection that goes to all players', () => {
    const projection = publicRoom(room);
    expect(JSON.stringify(projection)).not.toContain('seat-secret');
    expect(projection.players.every(player => !('secret' in player))).toBe(true);
    expect(projection.players.map(player => player.id)).toEqual(['host', 'guest']); // public handles still travel
  });
  it('carries the room premium flag into the public projection', () => { expect(publicRoom(room).premium).toBe(false); expect(publicRoom({ ...room, premium: true }).premium).toBe(true); });
  it('synchronizes clue submissions in player order', () => {
    const round = { ...createRound({ names: ['Alex', 'Jamie', 'Taylor'], category: 'mixed', minutes: 3, hints: true }, () => 0), phase: 'discussion' as const, cursor: 0 };
    const one = transition(round, { type: 'clue', text: 'cold' });
    const two = transition(one, { type: 'clue', text: 'bright' });
    expect(two.clues).toEqual(['cold', 'bright']);
    expect(two.cursor).toBe(2);
    expect(transition(two, { type: 'clue', text: '' })).toEqual(two);
  });
  it('exposes firstClue publicly so clients can attribute each clue to the right player when the round does not start at player 0', () => {
    const threePlayerRoom: RoomState = { ...room, players: [...room.players, { id: 'third', secret: 'third-seat-secret', name: 'Taylor', connected: true, isHost: false }] };
    const round = createRound({ names: ['Alex', 'Jamie', 'Taylor'], category: 'mixed', minutes: 3, hints: true }, () => .9);
    const discussion = { ...round, phase: 'discussion' as const, cursor: round.firstClue }; // mirrors how start() seeds discussion
    expect(discussion.firstClue).not.toBe(0); // otherwise this test wouldn't catch a regression to the old always-0 mapping
    const projection = publicRoom(threePlayerRoom, discussion);
    expect(projection.game?.firstClue).toBe(discussion.firstClue);
    expect(projection.game?.cursorPlayerId).toBe(threePlayerRoom.players[discussion.firstClue]?.id);
  });
  it('resolves distributed votes and requires a final imposter guess', () => {
    const base = { ...createRound({ names: ['Alex', 'Jamie', 'Taylor'], category: 'mixed', minutes: 3, hints: true }, () => 0), phase: 'voting' as const, cursor: 0, imposter: 1 };
    const afterAlex = transition(base, { type: 'vote', target: 1 });
    const afterJamie = transition(transition(afterAlex, { type: 'open-ballot' }), { type: 'vote', target: 0 });
    const result = transition({ ...afterJamie, phase: 'voting' as const, cursor: 2 }, { type: 'vote', target: 1 });
    expect(result.phase).toBe('guess');
    expect(transition(result, { type: 'guess', word: result.word.text }).winner).toBe('imposter');
  });
});
