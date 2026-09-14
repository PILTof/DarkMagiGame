import type { EventBus } from "../core/EventBus.ts";
import type { System } from "./System.ts";
import { TileInteraction } from "./contracts/EventNamesInterface.ts";

export class SelectionSystem implements System {
  private readonly eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.eventBus.on(TileInteraction.pointer_click, (payload) => {
      this.onTileClick(payload);
    });
  }

  update(_dt: number): void {}

  private onTileClick(_payload: unknown): void {
    // TODO: выбор юнита / тайла
  }
}
