import * as THREE from "three";
import { TILE_SIZE } from "../../config/gameConfig.ts";
import type { GridPos } from "../GridCoords.ts";
import type { TileAssets } from "./TileAssets.ts";

export type TileType = "grass" | "stone" | "water";

export type TileVisualConfig = {
  color?: number;
  roughness: number;
  metalness: number;
  height: number;
  segments?: number;
  texture?: THREE.Texture | null;
};

const geometryCache = new Map<string, THREE.CylinderGeometry>();

export abstract class Tile {
  readonly pos: GridPos;
  private root: THREE.Object3D | null = null;
  private loadPromise: Promise<THREE.Object3D> | null = null;

  constructor(pos: GridPos) {
    this.pos = pos;
  }

  abstract readonly type: TileType;
  abstract readonly walkable: boolean;

  loadMesh(assets: TileAssets): Promise<THREE.Object3D> {
    if (this.root) return Promise.resolve(this.root);

    this.loadPromise ??= this.createMesh(assets).then((root) => {
      this.applyMeshDefaults(root);
      this.root = root;
      return root;
    });

    return this.loadPromise;
  }

  get object3D(): THREE.Object3D {
    if (!this.root) {
      throw new Error(
        `Tile (${this.pos.q}, ${this.pos.r}) is not loaded. Call loadMesh() first.`,
      );
    }
    return this.root;
  }

  protected abstract createMesh(assets: TileAssets): Promise<THREE.Object3D>;

  protected abstract getVisualConfig(): TileVisualConfig;

  protected buildProceduralMesh(): THREE.Mesh {
    const config = this.getVisualConfig();
    const segments = config.segments ?? 6;
    const geometry = Tile.getHexGeometry(
      TILE_SIZE,
      config.height,
      segments,
    );
    const material = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: config.roughness,
      metalness: config.metalness,
      ...(config.texture ? { map: config.texture } : {}),
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -config.height / 2;
    mesh.rotation.y = Math.PI / 6;
    return mesh;
  }

  protected applyMeshDefaults(root: THREE.Object3D): void {
    root.userData = {
      q: this.pos.q,
      r: this.pos.r,
      type: "tile",
      tileType: this.type,
    };
  }

  protected static getHexGeometry(
    radius: number,
    height: number,
    segments: number,
  ): THREE.CylinderGeometry {
    const key = `${radius}:${height}:${segments}`;
    let geometry = geometryCache.get(key);
    if (!geometry) {
      geometry = new THREE.CylinderGeometry(
        radius,
        radius,
        height,
        segments,
      );
      geometryCache.set(key, geometry);
    }
    return geometry;
  }
}
