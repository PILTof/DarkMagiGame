import type { Scene } from "three";
import { EntityManager } from "../entities/EntityManager.ts";
import { Unit } from "../entities/Unit.ts";
import type { System } from "./System.ts";

export class DeathSystem implements System {
  private readonly scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  update(_dt: number): void {
    for (const entity of EntityManager.getInstance().getAll()) {
      if (entity instanceof Unit && !entity.isAlive()) {
        EntityManager.getInstance().remove(entity.id, this.scene);
      }
    }
  }
}
