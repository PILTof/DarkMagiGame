import * as THREE from "three";
import { TILE_SIZE } from "../../config/gameConfig.ts";
import { Tile } from "./Tile.ts";

const HEIGHT = 0.15;
const SEGMENTS = 6;

export class WaterTile extends Tile {
  readonly type = "water" as const;
  readonly walkable = false;

  private static geometry: THREE.CylinderGeometry | null = null;

  private readonly color = 0x3d6b8e;
  private readonly roughness = 0.2;
  private readonly metalness = 0.1;
  private readonly texture: THREE.Texture | null = null;

  protected buildMesh(): THREE.Mesh {
    const geometry = WaterTile.getGeometry();
    const material = this.createMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -HEIGHT / 2;
    return mesh;
  }

  private static getGeometry(): THREE.CylinderGeometry {
    if (!WaterTile.geometry) {
      WaterTile.geometry = new THREE.CylinderGeometry(
        TILE_SIZE,
        TILE_SIZE,
        HEIGHT,
        SEGMENTS,
      );
    }
    return WaterTile.geometry;
  }

  private createMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: this.color,
      roughness: this.roughness,
      metalness: this.metalness,
    });
  }
}
