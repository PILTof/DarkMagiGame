import { EntityManager } from "../entities/EntityManager.ts";
import type { System } from "./System.ts";

export class AnimationSystem implements System {
    constructor() {}

    update(dt: number): void {
        EntityManager.getInstance()
            .getProjectiles()
            .forEach((sprite) => {
                try {
                    sprite.animate(dt);
                } catch (error) {
                    console.log(error)
                }
            });
    }
}
