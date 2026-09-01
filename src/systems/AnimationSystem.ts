import type { EntityManager } from "../entities/EntityManager.ts";
import type { System } from "./System.ts";

export class AnimationSystem implements System {
  private readonly entityManager: EntityManager;

  constructor(entityManager: EntityManager) {
    this.entityManager = entityManager;
  }

  update(_dt: number): void {
    void this.entityManager;
    // TODO: mixer.update(dt) для GLTF-анимаций
  }
}
