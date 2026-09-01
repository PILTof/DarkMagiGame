import * as THREE from "three";
import type { GridPos } from "../world/GridCoords.ts";
import { Entity } from "./Entity.ts";

export class Unit extends Entity {
  worldPath: THREE.Vector3[] = [];
  selected = false;
  speed = 4;

  constructor(id: string, gridPos: GridPos, mesh: THREE.Group) {
    super(id, gridPos, mesh);
  }

  setWorldPath(path: THREE.Vector3[]): void {
    this.worldPath = path;
  }

  clearPath(): void {
    this.worldPath = [];
  }

  hasPath(): boolean {
    return this.worldPath.length > 0;
  }
}
