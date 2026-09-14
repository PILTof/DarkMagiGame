import type { Scene } from "three";
import { EntityManager } from "../entities/EntityManager.ts";
import { Unit } from "../entities/Unit.ts";
import type { System } from "./System.ts";

export class DeathSystem implements System {
  private readonly scene: Scene;
  private readonly entityManager: EntityManager;

  constructor(scene: Scene, entityManager: EntityManager) {
    this.scene = scene;
    this.entityManager = entityManager;
  }

  update(_dt: number): void {
    for (const entity of this.entityManager.getAll()) {
      if (entity instanceof Unit && !entity.isAlive()) {
        this.entityManager.remove(entity.id, this.scene);
      }
    }
  }
}
