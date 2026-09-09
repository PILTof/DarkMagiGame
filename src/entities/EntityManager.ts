import type * as THREE from "three";
import type { Entity } from "./Entity.ts";
import { Player, PLAYER_ID } from "./Player.ts";

export class EntityManager {
    private static instance: EntityManager | undefined;

    public static getInstance(): EntityManager {
        if (!EntityManager.instance) {
            EntityManager.instance = new EntityManager();
        }

        return EntityManager.instance;
    }

    private readonly entities = new Map<string, Entity>();

    add(entity: Entity, scene: THREE.Scene): void {
        this.entities.set(entity.id, entity);
        scene.add(entity.mesh);
    }

    remove(id: string, scene: THREE.Scene): void {
        const entity = this.entities.get(id);
        if (!entity) return;
        scene.remove(entity.mesh);
        this.entities.delete(id);
    }

    get(id: string): Entity | undefined {
        return this.entities.get(id);
    }

    getPlayer(): Player | undefined {
        const entity = this.entities.get(PLAYER_ID);
        return entity instanceof Player ? entity : undefined;
    }

    getAll(): Entity[] {
        return [...this.entities.values()];
    }

    getEnemies(): Entity[]
    {
        const arr = this.getAll();
        return arr.filter(entity => entity.mesh.userData.type == "enemy");
    }
}
