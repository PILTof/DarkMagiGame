import type { Scene } from "three";
import { EntityManager } from "../EntityManager";
import type { SpriteEntity } from "../SpriteEntity";

export class ProjectileManager {
    private static instance: ProjectileManager | undefined;

    public static getInstance(scene: Scene): ProjectileManager {
        if (!ProjectileManager.instance) {
            ProjectileManager.instance = new ProjectileManager(scene);
        }
        return ProjectileManager.instance;
    }

    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public setScene(scene: Scene): void {
        this.scene = scene;
    }

    public runProjectile(sprite: SpriteEntity): void {
        EntityManager.getInstance().add(sprite, this.scene)
    }
}
