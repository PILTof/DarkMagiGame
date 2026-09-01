import * as THREE from "three";
import type { GridPos } from "../GridCoords.ts";

export type TileType = "grass" | "stone" | "water";

export abstract class Tile {
  readonly pos: GridPos;
  readonly mesh: THREE.Mesh;

  constructor(pos: GridPos) {
    this.pos = pos;
    this.mesh = this.buildMesh();
    this.applyMeshDefaults(this.mesh);
  }

  abstract readonly type: TileType;
  abstract readonly walkable: boolean;

  protected abstract buildMesh(): THREE.Mesh;

  protected applyMeshDefaults(mesh: THREE.Mesh): void {
    mesh.rotation.y = Math.PI / 6;
    mesh.userData = {
      q: this.pos.q,
      r: this.pos.r,
      type: "tile",
      tileType: this.type,
    };
  }
}
