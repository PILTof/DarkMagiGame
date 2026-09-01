import type { EventBus } from "../core/EventBus.ts";
import type { Engine } from "../engine/Engine.ts";
import type { TileMap } from "../world/TileMap.ts";
import type { System } from "./System.ts";

export class InputSystem implements System {
  private readonly engine: Engine;
  private readonly tileMap: TileMap;
  private readonly eventBus: EventBus;

  constructor(engine: Engine, tileMap: TileMap, eventBus: EventBus) {
    this.engine = engine;
    this.tileMap = tileMap;
    this.eventBus = eventBus;
    this.engine.renderer.domElement.addEventListener("pointerdown", (e) => {
      this.onPointerDown(e);
    });
  }

  update(_dt: number): void {}

  private onPointerDown(event: PointerEvent): void {
    // TODO: raycast → tile:click
    void event;
    void this.tileMap;
    this.eventBus.emit("tile:click", { q: 0, r: 0 });
  }
}
