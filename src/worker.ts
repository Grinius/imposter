import { actionIsAuthorized, createRound, transition, type Action, type Settings } from '../lib/game';
import { signEntitlement, verifyEntitlement, type EntitlementPayload } from '../lib/entitlement';
import { freePlayerLimit, minPlayerLimit, premiumPlayerLimit } from '../lib/limits';
import { publicRoom, roomIdIsValid, type PrivateRole, type PublicRoom, type RoomPlayer, type RoomState } from '../lib/online';
import { wordHistoryCap } from '../lib/history';

export interface Env {
  ASSETS: Fetcher;
  ROOMS: DurableObjectNamespace;
  RATE_LIMITER: DurableObjectNamespace;
  REDEMPTIONS: DurableObjectNamespace;
  STRIPE_SECRET_KEY: string;
  ENTITLEMENT_SECRET: string;
}

// Cloudflare sets this at the edge from the real TCP connection; a client cannot spoof it the way
// it could an X-Forwarded-For header, so it is the one trustworthy per-visitor key available here.
function clientIp(request: Request): string { return request.headers.get('CF-Connecting-IP') ?? 'unknown'; }

// A premium claim from a client must never be able to break what it is attached to: any failure to
// verify — a malformed token, an unset or non-hex ENTITLEMENT_SECRET — simply means "not premium".
// Before this, a well-formed two-part token like "YWJj.ZGVm" made hexToBytes throw and took room
// creation down with it whenever the secret was not configured, which is its state until launch.
async function verifiedEntitlement(env: Env, token: string | undefined): Promise<EntitlementPayload | null> {
  if (!token || !env.ENTITLEMENT_SECRET) return null;
  try { return await verifyEntitlement(env.ENTITLEMENT_SECRET, token); } catch { return null; }
}

// A tiny fixed-window counter, one Durable Object instance per rate-limit key (so per IP+endpoint).
// Fails open on any error — a rate-limiter bug must never be the reason legitimate traffic breaks.
async function checkRateLimit(env: Env, key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    const stub = env.RATE_LIMITER.get(env.RATE_LIMITER.idFromName(key));
    const response = await stub.fetch(new Request('https://rate-limiter.internal/', { method: 'POST', body: JSON.stringify({ limit, windowMs }) }));
    return ((await response.json()) as { allowed: boolean }).allowed;
  } catch { return true; }
}

export class RateLimiter {
  private state: DurableObjectState;
  constructor(state: DurableObjectState) { this.state = state; }
  async fetch(request: Request): Promise<Response> {
    const { limit, windowMs } = await request.json() as { limit: number; windowMs: number };
    const now = Date.now();
    const bucket = (await this.state.storage.get<{ count: number; resetAt: number }>('bucket')) ?? { count: 0, resetAt: now + windowMs };
    if (now > bucket.resetAt) { bucket.count = 0; bucket.resetAt = now + windowMs; }
    bucket.count += 1;
    await this.state.storage.put({ bucket });
    this.state.storage.setAlarm(bucket.resetAt);
    return Response.json({ allowed: bucket.count <= limit });
  }
  async alarm() { await this.state.storage.deleteAll(); }
}

// How many entitlement tokens one paid Stripe Checkout session may ever mint. High enough for a
// buyer's own phone, laptop, and a cleared browser or two; low enough that a shared receipt link
// cannot unlock premium for an audience. Without accounts there is no way to tell those apart, so
// this bounds the damage rather than preventing sharing outright.
const MINTS_PER_SESSION = 5;

// Fails open for the same reason checkRateLimit does: a ledger outage must never stand between a
// real buyer and the thing they already paid for.
async function claimRedemption(env: Env, sessionId: string): Promise<boolean> {
  try {
    const stub = env.REDEMPTIONS.get(env.REDEMPTIONS.idFromName(sessionId));
    const response = await stub.fetch(new Request('https://redemptions.internal/', { method: 'POST', body: JSON.stringify({ limit: MINTS_PER_SESSION }) }));
    return ((await response.json()) as { allowed: boolean }).allowed;
  } catch { return true; }
}

// One instance per Stripe Checkout session id, holding a permanent tally of the tokens that single
// payment has minted. Deliberately has no alarm and no expiry: forgetting a redemption would hand
// the quota back.
export class RedemptionLedger {
  private state: DurableObjectState;
  constructor(state: DurableObjectState) { this.state = state; }
  async fetch(request: Request): Promise<Response> {
    const { limit } = await request.json() as { limit: number };
    const used = (await this.state.storage.get<number>('mints')) ?? 0;
    if (used >= limit) return Response.json({ allowed: false, used });
    await this.state.storage.put({ mints: used + 1 });
    return Response.json({ allowed: true, used: used + 1 });
  }
}

type ClientMessage =
  | { type: 'join'; name: string; playerId?: string; seat?: string; premiumToken?: string; create?: boolean }
  | { type: 'start'; settings: Settings }
  | { type: 'action'; action: Action; round: number }
  | { type: 'ping' };

type ServerMessage =
  | { type: 'room'; room: PublicRoom }
  | { type: 'seat'; playerId: string; seat: string }
  | { type: 'role'; role: PrivateRole }
  | { type: 'error'; message: string }
  | { type: 'pong' };

const ROOM_TTL_MS = 1000 * 60 * 60 * 12;
// Per-socket ceiling on messages. Well above anything a person playing can produce (a clue, a vote,
// the occasional ping), low enough that a joined client cannot make the room write storage and
// broadcast to everyone in a loop.
const MESSAGES_PER_SECOND = 20;
// Renew a premium token once it is inside its final two years, i.e. after roughly a year of use.
const RENEW_WITHIN_MS = 1000 * 60 * 60 * 24 * 365 * 2;

function json(message: ServerMessage) { return JSON.stringify(message); }
function randomId() { return crypto.randomUUID(); }
function randomRoomId() { return Array.from(crypto.getRandomValues(new Uint8Array(6)), value => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[value % 32]).join(''); }
function random() { return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296; }

// What each socket carries through hibernation via serializeAttachment/deserializeAttachment,
// since nothing about a specific connection survives in ordinary instance fields once the Durable
// Object has been evicted and later re-instantiated for a later message.
type SocketAttachment = { playerId: string };
function attachedPlayerId(ws: WebSocket): string | undefined {
  try { return (ws.deserializeAttachment() as SocketAttachment | null)?.playerId; } catch { return undefined; }
}

export class ImposterRoom {
  private state: DurableObjectState;
  private env: Env;
  private roomId = '';
  private room: RoomState | null = null;
  private roundState: ReturnType<typeof createRound> | null = null;
  private roles = new Map<string, PrivateRole>();
  // Only ever read within the same wake as the fetch() call that set it (room creation and the
  // reconnect-kick check both happen on the first message right after a socket connects, before the
  // object could hibernate) — safe despite resetting to 'unknown' whenever the object is re-instantiated.
  private clientIp = 'unknown';
  // Flood counters live in memory rather than in storage or the socket attachment, so the guard
  // costs nothing per message. A flooding client keeps this object awake, so the counter lasts
  // exactly as long as the flood does; a quiet room that hibernates loses only zeroes.
  private messageRate = new Map<WebSocket, { count: number; resetAt: number }>();

  constructor(state: DurableObjectState, env: Env) { this.state = state; this.env = env; }

  async alarm() {
    await this.load();
    if (this.room && this.room.players.every(player => !player.connected)) {
      await this.state.storage.deleteAll();
      this.room = null; this.roundState = null; this.roles.clear();
    } else if (this.room) {
      this.state.storage.setAlarm(Date.now() + ROOM_TTL_MS);
    }
  }

  async fetch(request: Request) {
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('WebSocket upgrade required', { status: 426 });
    this.clientIp = clientIp(request);
    await this.load();
    const id = new URL(request.url).pathname.split('/').pop();
    if (id && roomIdIsValid(id)) { this.roomId = id; if (this.room && !this.room.roomId) this.room.roomId = id; }
    const pair = new WebSocketPair();
    const client = pair[0], server = pair[1];
    // Hibernation API: acceptWebSocket registers the socket without pinning this object in memory
    // between messages — the runtime calls webSocketMessage/webSocketClose/webSocketError below
    // directly instead of the old server.accept() + addEventListener pattern.
    this.state.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  private async load() {
    if (this.room) return;
    this.room = await this.state.storage.get<RoomState>('room') ?? null;
    this.roundState = await this.state.storage.get<ReturnType<typeof createRound>>('round') ?? null;
    const storedRoles = await this.state.storage.get<[string, PrivateRole][]>('roles');
    this.roles = new Map(storedRoles ?? []);
  }

  // 'warn' is the first message over the ceiling and gets one explanation; everything after it is
  // dropped in silence, since answering a flood with a reply per message doubles it.
  private floodCheck(socket: WebSocket): 'ok' | 'warn' | 'drop' {
    const now = Date.now();
    const bucket = this.messageRate.get(socket);
    if (!bucket || now > bucket.resetAt) { this.messageRate.set(socket, { count: 1, resetAt: now + 1000 }); return 'ok'; }
    bucket.count += 1;
    if (bucket.count <= MESSAGES_PER_SECOND) return 'ok';
    return bucket.count === MESSAGES_PER_SECOND + 1 ? 'warn' : 'drop';
  }

  async webSocketMessage(socket: WebSocket, raw: string | ArrayBuffer) {
    const flood = this.floodCheck(socket);
    if (flood === 'drop') return;
    if (flood === 'warn') { this.send(socket, { type: 'error', message: 'That is too many actions at once. Slow down and try again.' }); return; }
    await this.load();
    let message: ClientMessage;
    try { message = JSON.parse(String(raw)) as ClientMessage; } catch { this.send(socket, { type: 'error', message: 'That message was not valid JSON.' }); return; }
    if (message.type === 'ping') { this.send(socket, { type: 'pong' }); return; }
    if (message.type === 'join') { await this.join(socket, message); return; }
    const playerId = attachedPlayerId(socket);
    if (!playerId || !this.room || !this.room.players.some(player => player.id === playerId)) { this.send(socket, { type: 'error', message: 'Join the room before sending actions.' }); return; }
    if (message.type === 'start') { await this.start(socket, playerId, message.settings); return; }
    if (message.type === 'action') { await this.action(socket, playerId, message); }
  }

  private async join(socket: WebSocket, message: Extract<ClientMessage, { type: 'join' }>) {
    const name = message.name.trim();
    if (!name || name.length > 20) { this.send(socket, { type: 'error', message: 'Choose a name from 1–20 characters.' }); return; }
    let player: RoomPlayer;
    if (!this.room) {
      // Durable Objects are created lazily on first access, so without this flag there is no way to
      // tell "this room doesn't exist yet" from "someone mistyped/guessed a code" — every random code
      // would silently spin up a fresh, empty room instead of a clear "room not found."  Only the
      // official create-room flow (which already generated this code itself) sets `create`.
      if (!message.create) { this.send(socket, { type: 'error', message: 'That room code doesn’t exist. Double-check it with whoever sent it.' }); return; }
      // Room creation is the one action here that actually spins up a persistent Durable Object, so
      // it is the meaningful thing to cap per IP — not the cheap /api/rooms code-mint that precedes it.
      if (!(await checkRateLimit(this.env, `create-room:${this.clientIp}`, 6, 15 * 60 * 1000))) { this.send(socket, { type: 'error', message: 'Too many rooms created recently. Please wait a few minutes and try again.' }); return; }
      // The room-creating player's token (if any) decides this room's player cap for its whole
      // lifetime. Verified server-side against our own signing secret — never trusted as-is.
      const premium = !!(await verifiedEntitlement(this.env, message.premiumToken));
      // Both halves of a seat are minted here, never accepted from the client: a client-chosen id
      // could deliberately collide with a seat it wants, and a client-chosen secret would be no
      // secret at all.
      player = { id: randomId(), secret: randomId(), name, connected: true, isHost: true };
      this.room = { roomId: this.roomId, hostId: player.id, status: 'lobby', players: [player], round: 0, premium };
    } else {
      // Re-attaching to an existing seat takes that seat's secret, which only ever went to the one
      // socket that owns it. Neither a name nor a player id is enough: both are public — every
      // player id is in every room broadcast — so accepting either would let any player in the room
      // re-join as someone else, kick them off their socket, and be handed their private role.
      const existing = message.playerId ? this.room.players.find(candidate => candidate.id === message.playerId) : undefined;
      if (existing && (!message.seat || existing.secret !== message.seat)) { this.send(socket, { type: 'error', message: 'That seat belongs to another player. Join with a new name instead.' }); return; }
      const cap = this.room.premium ? premiumPlayerLimit : freePlayerLimit;
      if (this.room.status !== 'lobby' && !existing) { this.send(socket, { type: 'error', message: 'This round has already started.' }); return; }
      if (this.room.players.length >= cap && !existing) { this.send(socket, { type: 'error', message: this.room.premium ? `This room is full (${cap} players).` : `This free room is full. Premium will unlock up to ${premiumPlayerLimit} players.` }); return; }
      if (existing) {
        const previous = this.state.getWebSockets().find(candidate => candidate !== socket && attachedPlayerId(candidate) === existing.id);
        if (previous) { try { previous.close(4001, 'Reconnected elsewhere'); } catch { /* already closed */ } }
        existing.name = name; existing.connected = true;
        player = existing;
      } else {
        player = { id: randomId(), secret: randomId(), name, connected: true, isHost: false };
        this.room.players.push(player);
      }
    }
    socket.serializeAttachment({ playerId: player.id } satisfies SocketAttachment);
    // The seat credential goes to this one socket and nowhere else — never into a broadcast, and
    // never into publicRoom(), which is why it lives outside PublicRoom's player shape entirely.
    this.send(socket, { type: 'seat', playerId: player.id, seat: player.secret });
    await this.persist();
    this.broadcast({ type: 'room', room: publicRoom(this.room, this.roundState) });
    // Reconnecting mid-round must not lose the player's private role/word: start() only pushes
    // roles at round start, so resend the current round's role here too.
    const role = this.roundState ? this.roles.get(player.id) : undefined;
    if (role && role.round === this.room.round) this.send(socket, { type: 'role', role });
  }

  private async start(socket: WebSocket, playerId: string, settings: Settings) {
    if (!this.room || this.room.hostId !== playerId || this.room.players.length < minPlayerLimit) { this.send(socket, { type: 'error', message: `The host needs at least ${minPlayerLimit} players to start.` }); return; }
    if (!['lobby', 'finished'].includes(this.room.status)) { this.send(socket, { type: 'error', message: 'This room is already in progress.' }); return; }
    try { const freshRound = createRound({ ...settings, names: this.room.players.map(player => player.name) }, random, this.room.recentWords ?? [], { maxPlayers: this.room.premium ? premiumPlayerLimit : freePlayerLimit, premium: this.room.premium }); this.roundState = { ...freshRound, phase: 'discussion', cursor: freshRound.firstClue }; }
    catch (error) { this.send(socket, { type: 'error', message: error instanceof Error ? error.message : 'Those settings were invalid.' }); return; }
    this.room.status = 'playing'; this.room.round += 1; this.room.recentWords = [...(this.room.recentWords ?? []).filter(id => id !== this.roundState!.word.id), this.roundState!.word.id].slice(-wordHistoryCap);
    this.roles = new Map(this.room.players.map((player, index) => [player.id, index === this.roundState!.imposter ? { round: this.room!.round, role: 'imposter', hint: this.roundState!.settings.hints ? this.roundState!.word.category : undefined } : { round: this.room!.round, role: 'friend', word: this.roundState!.word.text }]));
    await this.persist(); this.broadcast({ type: 'room', room: publicRoom(this.room, this.roundState) });
    for (const client of this.state.getWebSockets()) { const id = attachedPlayerId(client); const role = id ? this.roles.get(id) : undefined; if (role) this.send(client, { type: 'role', role }); }
  }

  private async action(socket: WebSocket, playerId: string, message: Extract<ClientMessage, { type: 'action' }>) {
    if (!this.room || !this.roundState || this.room.status !== 'playing' || message.round !== this.room.round) { this.send(socket, { type: 'error', message: 'That action belongs to an old or inactive round.' }); return; }
    if (!this.room.players.some(player => player.id === playerId && player.connected)) { this.send(socket, { type: 'error', message: 'You are not an active player in this room.' }); return; }
    const playerIndex = this.room.players.findIndex(player => player.id === playerId);
    const action = message.action.type === 'guess' ? { ...message.action, word: message.action.word.slice(0, 60) } : message.action;
    // `transition` attributes a clue or a ballot to `round.cursor`, not to whoever sent it, so
    // without this check any player could speak and vote in every other player's name.
    if (!actionIsAuthorized(this.roundState, { index: playerIndex, isHost: this.room.hostId === playerId }, action)) {
      this.send(socket, { type: 'error', message: 'That action is not yours or is not available yet.' }); return;
    }
    const before = JSON.stringify(this.roundState);
    this.roundState = transition(this.roundState, action);
    if (JSON.stringify(this.roundState) === before) { this.send(socket, { type: 'error', message: 'That action is not valid in the current phase.' }); return; }
    if (this.roundState.phase === 'result') this.room.status = 'finished';
    await this.persist(); this.broadcast({ type: 'room', room: publicRoom(this.room, this.roundState) });
  }

  // Called directly by the runtime (Hibernation API) when a socket closes or errors — this object may
  // have just been freshly re-instantiated to handle it, so load() first rather than assuming
  // in-memory state from an earlier message is still there.
  async webSocketClose(socket: WebSocket) { await this.disconnect(socket); }
  async webSocketError(socket: WebSocket) { await this.disconnect(socket); }
  private async disconnect(socket: WebSocket) {
    this.messageRate.delete(socket);
    await this.load();
    const id = attachedPlayerId(socket);
    if (!id || !this.room) return;
    const player = this.room.players.find(candidate => candidate.id === id);
    if (player) {
      player.connected = false;
      if (player.id === this.room.hostId) {
        const successor = this.room.players.find(candidate => candidate.connected);
        if (successor) { this.room.hostId = successor.id; this.room.players.forEach(candidate => { candidate.isHost = candidate.id === successor.id; }); }
      }
    }
    await this.persist();
    this.broadcast({ type: 'room', room: publicRoom(this.room, this.roundState) });
  }
  private send(socket: WebSocket, message: ServerMessage) { try { socket.send(json(message)); } catch { /* disconnected sockets are cleaned up by close */ } }
  private broadcast(message: ServerMessage) { for (const socket of this.state.getWebSockets()) this.send(socket, message); }
  private async persist() { if (!this.room) return; await this.state.storage.put({ room: this.room, round: this.roundState, roles: [...this.roles] }); this.state.storage.setAlarm(Date.now() + ROOM_TTL_MS); }
}

export default { async fetch(request: Request, env: Env) {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})$/);
  if (match && request.method === 'GET') {
    // WebSockets are exempt from the same-origin policy, so without this any third-party page could
    // open sockets into rooms from a visitor's browser. A missing Origin (curl, tests, native
    // clients) is allowed; a foreign one is not.
    const origin = request.headers.get('Origin');
    if (origin && origin !== url.origin) return new Response('Forbidden', { status: 403 });
    // Probing room codes is otherwise free and unmetered, and every attempt instantiates a Durable
    // Object. 32^6 codes only stay out of reach while guesses cost the guesser something.
    if (!(await checkRateLimit(env, `join-room:${clientIp(request)}`, 30, 5 * 60 * 1000))) return Response.json({ error: 'Too many room connections. Please wait a few minutes and try again.' }, { status: 429 });
    const roomId = match[1]; const id = env.ROOMS.idFromName(roomId); const room = env.ROOMS.get(id);
    // Forward the real client IP so the room's own rate limiting (room creation) has something
    // trustworthy to key on — a fresh internal Request carries none of the original headers otherwise.
    return room.fetch(new Request(`https://room.internal/${roomId}`, { headers: { Upgrade: 'websocket', 'CF-Connecting-IP': clientIp(request) } }));
  }
  if (url.pathname === '/api/rooms' && request.method === 'POST') {
    if (!(await checkRateLimit(env, `mint-code:${clientIp(request)}`, 20, 15 * 60 * 1000))) return Response.json({ error: 'Too many attempts. Please wait a few minutes and try again.' }, { status: 429 });
    return Response.json({ roomId: randomRoomId() }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (url.pathname === '/api/premium/verify' && request.method === 'POST') {
    if (!(await checkRateLimit(env, `premium-verify:${clientIp(request)}`, 10, 10 * 60 * 1000))) return Response.json({ error: 'Too many attempts. Please wait a few minutes and try again.' }, { status: 429 });
    return verifyPremiumCheckout(request, env);
  }
  if (url.pathname === '/api/premium/status' && request.method === 'POST') {
    if (!(await checkRateLimit(env, `premium-status:${clientIp(request)}`, 60, 60 * 1000))) return Response.json({ premium: false }, { status: 429, headers: { 'Cache-Control': 'no-store' } });
    return premiumStatus(request, env);
  }
  return env.ASSETS.fetch(request);
} };

// Confirms a Stripe Checkout session was actually paid (asking Stripe directly, with our secret
// key — never trusting the session id's mere presence) and, only then, mints a signed entitlement
// token the client can present later. A client-supplied session id alone proves nothing on its own.
export async function verifyPremiumCheckout(request: Request, env: Env): Promise<Response> {
  if (!env.STRIPE_SECRET_KEY || !env.ENTITLEMENT_SECRET) return Response.json({ error: 'Payments are not configured yet.' }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: 'That request was not valid JSON.' }, { status: 400 }); }
  const sessionId = body && typeof body === 'object' && 'sessionId' in body ? (body as { sessionId: unknown }).sessionId : undefined;
  if (typeof sessionId !== 'string' || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return Response.json({ error: 'That does not look like a Stripe Checkout session id.' }, { status: 400 });
  // A browser that already holds a valid token for this very session is not a new device: reloading
  // the success page, or pasting the same link into "Restore purchase" again, re-issues its token
  // without a Stripe lookup and without spending one of the session's device mints. The token was
  // only ever minted after Stripe confirmed payment, so it is proof enough on its own.
  const presented = body && typeof body === 'object' && 'token' in body ? (body as { token: unknown }).token : undefined;
  const held = typeof presented === 'string' ? await verifiedEntitlement(env, presented) : null;
  if (held && held.sessionId === sessionId) {
    const { token, expiresAt } = await signEntitlement(env.ENTITLEMENT_SECRET, sessionId);
    return Response.json({ token, expiresAt }, { headers: { 'Cache-Control': 'no-store' } });
  }
  const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } });
  if (!stripeResponse.ok) return Response.json({ error: 'Could not look up that checkout session with Stripe.' }, { status: 502 });
  const session = await stripeResponse.json() as { payment_status?: string; status?: string };
  if (session.status !== 'complete' || session.payment_status !== 'paid') return Response.json({ error: 'That checkout has not been completed and paid yet.' }, { status: 402 });
  // Only charged once payment is confirmed, so failed or unpaid attempts never burn a buyer's quota.
  if (!(await claimRedemption(env, sessionId))) return Response.json({ error: `This payment has already unlocked premium on ${MINTS_PER_SESSION} devices. Get in touch if you need it moved to another one.` }, { status: 409 });
  const { token, expiresAt } = await signEntitlement(env.ENTITLEMENT_SECRET, sessionId);
  return Response.json({ token, expiresAt }, { headers: { 'Cache-Control': 'no-store' } });
}

// Lets a client check whether a stored token is still a legitimately signed, unexpired entitlement,
// without exposing the signing secret itself to anyone. The token arrives in the request body, not
// in the URL: it is a bearer credential, and query strings are written to request logs and analytics
// where anyone with log access could lift and replay one.
export async function premiumStatus(request: Request, env: Env): Promise<Response> {
  const notPremium = Response.json({ premium: false }, { headers: { 'Cache-Control': 'no-store' } });
  let body: unknown;
  try { body = await request.json(); } catch { return notPremium; }
  const token = body && typeof body === 'object' && 'token' in body ? (body as { token: unknown }).token : undefined;
  const payload = typeof token === 'string' ? await verifiedEntitlement(env, token) : null;
  if (!payload) return notPremium;
  // Tokens now carry a bounded life instead of an effectively permanent one, so a copied or
  // abandoned token eventually dies. A device that keeps playing renews silently well before then,
  // so a real buyer never has to go back through checkout — see docs/DECISIONS.md.
  const renewed = payload.exp - Date.now() < RENEW_WITHIN_MS ? (await signEntitlement(env.ENTITLEMENT_SECRET, payload.sessionId)).token : undefined;
  return Response.json({ premium: true, ...(renewed ? { token: renewed } : {}) }, { headers: { 'Cache-Control': 'no-store' } });
}
