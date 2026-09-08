import { createRound, transition, type Action, type Settings } from '../lib/game';
import { publicRoom, roomIdIsValid, type PrivateRole, type PublicRoom } from '../lib/online';

export interface Env {
  ASSETS: Fetcher;
  ROOMS: DurableObjectNamespace;
}

type ClientMessage =
  | { type: 'join'; name: string; playerId?: string }
  | { type: 'start'; settings: Settings }
  | { type: 'action'; action: Action; round: number }
  | { type: 'ping' };

type ServerMessage =
  | { type: 'room'; room: PublicRoom }
  | { type: 'role'; role: PrivateRole }
  | { type: 'error'; message: string }
  | { type: 'pong' };

const ROOM_TTL_MS = 1000 * 60 * 60 * 12;

function json(message: ServerMessage) { return JSON.stringify(message); }
function randomId() { return crypto.randomUUID(); }
function randomRoomId() { return Array.from(crypto.getRandomValues(new Uint8Array(6)), value => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[value % 32]).join(''); }
function random() { return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296; }

export class ImposterRoom {
  private state: DurableObjectState;
  private sockets = new Map<WebSocket, string>();
  private room: PublicRoom | null = null;
  private roundState: ReturnType<typeof createRound> | null = null;
  private roles = new Map<string, PrivateRole>();

  constructor(state: DurableObjectState) { this.state = state; }

  async fetch(request: Request) {
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('WebSocket upgrade required', { status: 426 });
    await this.load();
    if (this.room && !this.room.roomId) {
      const id = new URL(request.url).pathname.split('/').pop();
      if (id && roomIdIsValid(id)) this.room.roomId = id;
    }
    const pair = new WebSocketPair();
    const client = pair[0], server = pair[1];
    server.accept();
    server.addEventListener('message', (event: MessageEvent) => { void this.message(server, String(event.data)); });
    server.addEventListener('close', () => this.disconnect(server));
    return new Response(null, { status: 101, webSocket: client });
  }

  private async load() {
    if (this.room) return;
    this.room = await this.state.storage.get<PublicRoom>('room') ?? null;
    this.roundState = await this.state.storage.get<ReturnType<typeof createRound>>('round') ?? null;
    const storedRoles = await this.state.storage.get<[string, PrivateRole][]>('roles');
    this.roles = new Map(storedRoles ?? []);
  }

  private async message(socket: WebSocket, raw: string) {
    await this.load();
    let message: ClientMessage;
    try { message = JSON.parse(raw) as ClientMessage; } catch { this.send(socket, { type: 'error', message: 'That message was not valid JSON.' }); return; }
    if (message.type === 'ping') { this.send(socket, { type: 'pong' }); return; }
    if (message.type === 'join') { await this.join(socket, message); return; }
    const playerId = this.sockets.get(socket);
    if (!playerId || !this.room || !this.room.players.some(player => player.id === playerId)) { this.send(socket, { type: 'error', message: 'Join the room before sending actions.' }); return; }
    if (message.type === 'start') { await this.start(socket, playerId, message.settings); return; }
    if (message.type === 'action') { await this.action(socket, playerId, message); }
  }

  private async join(socket: WebSocket, message: Extract<ClientMessage, { type: 'join' }>) {
    const name = message.name.trim();
    if (!name || name.length > 20) { this.send(socket, { type: 'error', message: 'Choose a name from 1–20 characters.' }); return; }
    if (!this.room) {
      const id = message.playerId && /^[a-f0-9-]{36}$/.test(message.playerId) ? message.playerId : randomId();
      this.room = { roomId: '', hostId: id, status: 'lobby', players: [{ id, name, connected: true, isHost: true }], round: 0 };
    } else {
      if (this.room.status !== 'lobby') { this.send(socket, { type: 'error', message: 'This round has already started.' }); return; }
      if (this.room.players.length >= 12) { this.send(socket, { type: 'error', message: 'This room is full.' }); return; }
      const existing = this.room.players.find(player => player.id === message.playerId);
      if (existing) { existing.name = name; existing.connected = true; }
      else this.room.players.push({ id: randomId(), name, connected: true, isHost: false });
    }
    const player = this.room.players.find(candidate => candidate.name === name && candidate.connected);
    if (!player) { this.send(socket, { type: 'error', message: 'Could not join this room.' }); return; }
    this.sockets.set(socket, player.id);
    await this.persist();
    this.broadcast({ type: 'room', room: publicRoom(this.room) });
  }

  private async start(socket: WebSocket, playerId: string, settings: Settings) {
    if (!this.room || this.room.hostId !== playerId || this.room.players.length < 3) { this.send(socket, { type: 'error', message: 'The host needs at least three players to start.' }); return; }
    if (this.room.status !== 'lobby') { this.send(socket, { type: 'error', message: 'This room is already in progress.' }); return; }
    try { this.roundState = createRound({ ...settings, names: this.room.players.map(player => player.name) }, random); }
    catch (error) { this.send(socket, { type: 'error', message: error instanceof Error ? error.message : 'Those settings were invalid.' }); return; }
    this.room.status = 'playing'; this.room.round += 1;
    this.roles = new Map(this.room.players.map((player, index) => [player.id, index === this.roundState!.imposter ? { round: this.room!.round, role: 'imposter', hint: this.roundState!.settings.hints ? this.roundState!.word.category : undefined } : { round: this.room!.round, role: 'friend', word: this.roundState!.word.text }]));
    await this.persist(); this.broadcast({ type: 'room', room: publicRoom(this.room) });
    for (const [client, id] of this.sockets) { const role = this.roles.get(id); if (role) this.send(client, { type: 'role', role }); }
  }

  private async action(socket: WebSocket, playerId: string, message: Extract<ClientMessage, { type: 'action' }>) {
    if (!this.room || !this.roundState || this.room.status !== 'playing' || message.round !== this.room.round) { this.send(socket, { type: 'error', message: 'That action belongs to an old or inactive round.' }); return; }
    if (!this.room.players.some(player => player.id === playerId && player.connected)) { this.send(socket, { type: 'error', message: 'You are not an active player in this room.' }); return; }
    // The first network slice validates membership and round freshness. The shared action
    // protocol is deliberately kept private until the multiplayer turn UI is wired.
    if (message.action.type === 'guess') message.action = { ...message.action, word: message.action.word.slice(0, 60) };
    this.roundState = transition(this.roundState, message.action);
    await this.persist(); this.broadcast({ type: 'room', room: publicRoom(this.room) });
  }

  private disconnect(socket: WebSocket) { const id = this.sockets.get(socket); if (!id || !this.room) return; this.sockets.delete(socket); const player = this.room.players.find(candidate => candidate.id === id); if (player) player.connected = false; void this.persist().then(() => this.broadcast({ type: 'room', room: publicRoom(this.room!) })); }
  private send(socket: WebSocket, message: ServerMessage) { try { socket.send(json(message)); } catch { /* disconnected sockets are cleaned up by close */ } }
  private broadcast(message: ServerMessage) { for (const socket of this.sockets.keys()) this.send(socket, message); }
  private async persist() { if (!this.room) return; await this.state.storage.put({ room: this.room, round: this.roundState, roles: [...this.roles] }); this.state.storage.setAlarm(Date.now() + ROOM_TTL_MS); }
}

export default { async fetch(request: Request, env: Env) {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})$/);
  if (match && request.method === 'GET') {
    const roomId = match[1]; const id = env.ROOMS.idFromName(roomId); const room = env.ROOMS.get(id);
    return room.fetch(new Request(`https://room.internal/${roomId}`, { headers: { Upgrade: 'websocket' } }));
  }
  if (url.pathname === '/api/rooms' && request.method === 'POST') {
    return Response.json({ roomId: randomRoomId() }, { headers: { 'Cache-Control': 'no-store' } });
  }
  return env.ASSETS.fetch(request);
} };
