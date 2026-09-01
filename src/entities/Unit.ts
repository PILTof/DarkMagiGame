import * as THREE from "three";
import type { GridPos } from "../world/GridCoords.ts";
import { Entity } from "./Entity.ts";

export class Unit extends Entity {
  path: THREE.Vector3[] = [];
  selected = false;
  speed = 4;

  constructor(id: string, gridPos: GridPos, mesh: THREE.Group) {
    super(id, gridPos, mesh);
  }
}
