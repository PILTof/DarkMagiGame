import * as THREE from "three";
import { TILE_SIZE } from "../../config/gameConfig.ts";
import type { GridPos } from "../GridCoords.ts";

export type TileType = "grass" | "stone" | "water";

export type TileVisualConfig = {
  color: number;
  roughness: number;
  metalness: number;
  height: number;
  segments?: number;
  texture?: THREE.Texture | null;
};

const geometryCache = new Map<string, THREE.CylinderGeometry>();

export abstract class Tile {
  readonly pos: GridPos;
  private _mesh: THREE.Mesh | null = null;

  constructor(pos: GridPos) {
    this.pos = pos;
  }

  /**
   * Меш создаётся лениво: к моменту первого обращения
   * конструктор наследника уже завершён и все поля инициализированы.
   */
  get mesh(): THREE.Mesh {
    if (!this._mesh) {
      this._mesh = this.buildMesh();
      this.applyMeshDefaults(this._mesh);
    }
    return this._mesh;
  }

  abstract readonly type: TileType;
  abstract readonly walkable: boolean;

  protected abstract getVisualConfig(): TileVisualConfig;

  protected buildMesh(): THREE.Mesh {
    const config = this.getVisualConfig();
    const segments = config.segments ?? 6;
    const geometry = Tile.getHexGeometry(TILE_SIZE, config.height, segments);
    const material = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: config.roughness,
      metalness: config.metalness,
      ...(config.texture ? { map: config.texture } : {}),
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -config.height / 2;
    return mesh;
  }

  protected applyMeshDefaults(mesh: THREE.Mesh): void {
    mesh.rotation.y = Math.PI / 6;
    mesh.userData = {
      q: this.pos.q,
      r: this.pos.r,
      type: "tile",
      tileType: this.type,
    };
  }

  private static getHexGeometry(
    radius: number,
    height: number,
    segments: number,
  ): THREE.CylinderGeometry {
    const key = `${radius}:${height}:${segments}`;
    let geometry = geometryCache.get(key);
    if (!geometry) {
      geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
      geometryCache.set(key, geometry);
    }
    return geometry;
  }
}
