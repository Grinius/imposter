interface Fetcher { fetch(request: Request): Promise<Response>; }
interface DurableObjectNamespace { idFromName(name: string): DurableObjectId; get(id: DurableObjectId): DurableObjectStub; }
type DurableObjectId = { readonly name?: string };
interface DurableObjectStub { fetch(request: Request): Promise<Response>; }
interface DurableObjectStorage { get<T>(key: string): Promise<T | undefined>; put(values: Record<string, unknown>): Promise<void>; deleteAll(): Promise<void>; setAlarm(timestamp: number): void; }
interface DurableObjectState { storage: DurableObjectStorage; }
interface WebSocketPair { 0: WebSocket; 1: WebSocket; }
declare const WebSocketPair: { new(): WebSocketPair };
interface ResponseInit { webSocket?: WebSocket; }
interface WebSocket { accept(): void; }
