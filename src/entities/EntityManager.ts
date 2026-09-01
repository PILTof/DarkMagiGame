import type * as THREE from "three";
import type { Entity } from "./Entity.ts";

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

  getAll(): Entity[] {
    return [...this.entities.values()];
  }
}
