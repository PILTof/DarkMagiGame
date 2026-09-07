import * as THREE from "three";
import type { GridPos } from "../world/GridCoords.ts";

export class Entity {
  readonly id: string;
  gridPos: GridPos;
  readonly mesh: THREE.Group;
  readonly position: THREE.Vector3; // Мировая позиция сущности

  constructor(id: string, gridPos: GridPos, mesh: THREE.Group) {
    this.id = id;
    this.gridPos = gridPos;
    this.mesh = mesh;
    this.position = new THREE.Vector3();
  }

  /**
   * Синхронизирует позицию mesh с позицией сущности
   */
  syncMeshPosition(): void {
    this.mesh.position.copy(this.position);
  }
}
