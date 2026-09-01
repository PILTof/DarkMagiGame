import * as THREE from "three";
import { TILE_SIZE } from "../../config/gameConfig.ts";
import { Tile } from "./Tile.ts";

const HEIGHT = 0.22;
const SEGMENTS = 6;

export class StoneTile extends Tile {
  readonly type = "stone" as const;
  readonly walkable = true;

  private static geometry: THREE.CylinderGeometry | null = null;

  private readonly color = 0x6b6b6b;
  private readonly roughness = 0.7;
  private readonly metalness = 0.05;
  private readonly texture: THREE.Texture | null = null;

  protected buildMesh(): THREE.Mesh {
    const geometry = StoneTile.getGeometry();
    const material = this.createMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -HEIGHT / 2;
    return mesh;
  }

  private static getGeometry(): THREE.CylinderGeometry {
    if (!StoneTile.geometry) {
      StoneTile.geometry = new THREE.CylinderGeometry(
        TILE_SIZE,
        TILE_SIZE,
        HEIGHT,
        SEGMENTS,
      );
    }
    return StoneTile.geometry;
  }

  private createMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: this.color,
      roughness: this.roughness,
      metalness: this.metalness,
    });
  }
}
