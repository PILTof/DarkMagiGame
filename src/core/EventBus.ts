import type { GameEventMap } from "./GameEvents.ts";

type EventCallback<TPayload> = (payload: TPayload) => void;

/** Synchronous, instance-scoped event bus for one game session. */
export class EventBus<TEvents extends object = GameEventMap> {
  private readonly listeners = new Map<keyof TEvents, Set<EventCallback<unknown>>>();

  on<TKey extends keyof TEvents>(
    event: TKey,
    callback: EventCallback<TEvents[TKey]>,
  ): () => void {
    const callbacks = this.listeners.get(event) ?? new Set<EventCallback<unknown>>();
    callbacks.add(callback as EventCallback<unknown>);
    this.listeners.set(event, callbacks);
    return () => this.off(event, callback);
  }

  off<TKey extends keyof TEvents>(event: TKey, callback: EventCallback<TEvents[TKey]>): void {
    this.listeners.get(event)?.delete(callback as EventCallback<unknown>);
  }

  emit<TKey extends keyof TEvents>(event: TKey, payload: TEvents[TKey]): void {
    this.listeners.get(event)?.forEach((callback) => callback(payload));
  }

  clear(): void {
    this.listeners.clear();
  }
}

