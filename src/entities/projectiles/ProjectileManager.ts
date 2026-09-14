import type { Scene } from "three";
import { EntityManager } from "../EntityManager";
import type { SpriteEntity } from "../SpriteEntity";

export class ProjectileManager {
    private readonly scene: Scene;
    private readonly entityManager: EntityManager;

    constructor(scene: Scene, entityManager: EntityManager) {
        this.scene = scene;
        this.entityManager = entityManager;
    }

    /**
     * Время жизни ограничено классом сущности проджетайла
     * @param sprite 
     */
    public runProjectile(sprite: SpriteEntity): void {
        this.entityManager.add(sprite, this.scene);

        sprite.getProgress().then(() => {
            this.entityManager.remove(sprite.id, this.scene);
        });
    }
}
