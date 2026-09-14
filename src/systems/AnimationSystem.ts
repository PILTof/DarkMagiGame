import type { EntityManager } from "../entities/EntityManager.ts";
import type { System } from "./System.ts";

export class AnimationSystem implements System {
    private readonly entityManager: EntityManager;

    constructor(entityManager: EntityManager) {
        this.entityManager = entityManager;
    }

    update(dt: number): void {
        this.entityManager.getProjectiles().forEach((sprite) => {
            try {
                sprite.animate(dt);
            } catch (error) {
                console.log(error);
            }
        });
    }
}
