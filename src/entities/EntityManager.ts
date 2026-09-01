import type * as THREE from "three";
import { PLAYER_ID } from "./Player.ts";
import type { Entity } from "./Entity.ts";
import { Unit } from "./Unit.ts";

export class EntityManager {
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

  getPlayer(): Unit | undefined {
    const entity = this.entities.get(PLAYER_ID);
    return entity instanceof Unit ? entity : undefined;
  }

  getAll(): Entity[] {
    return [...this.entities.values()];
  }
}
