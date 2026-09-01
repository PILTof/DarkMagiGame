import * as THREE from "three";
import type { GridPos } from "../world/GridCoords.ts";

export class Entity {
  readonly id: string;
  gridPos: GridPos;
  readonly mesh: THREE.Group;

  constructor(id: string, gridPos: GridPos, mesh: THREE.Group) {
    this.id = id;
    this.gridPos = gridPos;
    this.mesh = mesh;
  }
}
