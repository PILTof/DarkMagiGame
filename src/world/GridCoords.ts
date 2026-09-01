import * as THREE from "three";
import { TILE_SIZE } from "../config/gameConfig.ts";

export type GridPos = { gx: number; gy: number };

export class GridCoords {
  static gridToWorld(gx: number, gy: number): THREE.Vector3 {
    return new THREE.Vector3(gx * TILE_SIZE, 0, gy * TILE_SIZE);
  }

  static worldToGrid(pos: THREE.Vector3): GridPos {
    return {
      gx: Math.round(pos.x / TILE_SIZE),
      gy: Math.round(pos.z / TILE_SIZE),
    };
  }
}
