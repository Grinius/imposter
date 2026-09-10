interface Fetcher { fetch(request: Request): Promise<Response>; }
interface DurableObjectNamespace { idFromName(name: string): DurableObjectId; get(id: DurableObjectId): DurableObjectStub; }
type DurableObjectId = { readonly name?: string };
interface DurableObjectStub { fetch(request: Request): Promise<Response>; }
interface DurableObjectStorage { get<T>(key: string): Promise<T | undefined>; put(values: Record<string, unknown>): Promise<void>; deleteAll(): Promise<void>; setAlarm(timestamp: number): void; }
interface DurableObjectState {
  storage: DurableObjectStorage;
  // The Hibernation WebSocket API: acceptWebSocket registers a socket without keeping the Durable
  // Object pinned in memory between messages; getWebSockets reconstructs the current connection list
  // on each wake (nothing about connections survives in normal instance fields across hibernation).
  acceptWebSocket(ws: WebSocket, tags?: string[]): void;
  getWebSockets(tag?: string): WebSocket[];
}
interface WebSocketPair { 0: WebSocket; 1: WebSocket; }
declare const WebSocketPair: { new(): WebSocketPair };
interface ResponseInit { webSocket?: WebSocket; }
interface WebSocket {
  accept(): void;
  // Small values attached directly to the socket itself, so they survive hibernation even though
  // nothing else about the connection (e.g. a Map keyed by the WebSocket object) would.
  serializeAttachment(value: unknown): void;
  deserializeAttachment(): unknown;
}
