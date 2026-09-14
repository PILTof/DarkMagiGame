import { describe, expect, it } from "vitest";
import { EventBus } from "../../src/core/EventBus.ts";

type TestEvents = {
  changed: { value: number };
};

describe("EventBus", () => {
  it("publishes typed payloads synchronously and unsubscribes listeners", () => {
    const bus = new EventBus<TestEvents>();
    const received: number[] = [];
    const unsubscribe = bus.on("changed", ({ value }) => received.push(value));

    bus.emit("changed", { value: 1 });
    unsubscribe();
    bus.emit("changed", { value: 2 });

    expect(received).toEqual([1]);
  });

  it("clears all listeners", () => {
    const bus = new EventBus<TestEvents>();
    const listener = (): void => { throw new Error("listener should be cleared"); };
    bus.on("changed", listener);
    bus.clear();

    expect(() => bus.emit("changed", { value: 1 })).not.toThrow();
  });
});
