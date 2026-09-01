import * as THREE from "three";
import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "../config/gameConfig.ts";
import { GridCoords } from "./GridCoords.ts";
import { Tile, type TileType } from "./Tile.ts";

const TILE_COLORS: Record<TileType, number> = {
  grass: 0x4a7c59,
  stone: 0x6b6b6b,
  water: 0x3d6b8e,
};

const HEX_HEIGHT = 0.2;

export class TileMap {
  readonly group = new THREE.Group();
  readonly tiles: Tile[][] = [];
  private readonly scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.group);
  }

  build(): void {
    const geometry = new THREE.CylinderGeometry(
      TILE_SIZE,
      TILE_SIZE,
      HEX_HEIGHT,
      6,
    );

    for (let r = 0; r < MAP_HEIGHT; r++) {
      const row: Tile[] = [];
      for (let q = 0; q < MAP_WIDTH; q++) {
        const type: TileType =
          (q + r) % 7 === 0
            ? "water"
            : (q + r) % 5 === 0
              ? "stone"
              : "grass";
        const walkable = type !== "water";
        const tile = new Tile({ q, r }, type, walkable);
        row.push(tile);

        const material = new THREE.MeshStandardMaterial({
          color: TILE_COLORS[type],
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.y = Math.PI / 6;
        const worldPos = GridCoords.gridToWorld(q, r);
        mesh.position.set(worldPos.x, -HEX_HEIGHT / 2, worldPos.z);
        mesh.userData = { q, r, type: "tile" };
        this.group.add(mesh);
      }
      this.tiles.push(row);
    }

    this.centerMap();
  }

  getTile(q: number, r: number): Tile | null {
    if (q < 0 || r < 0 || q >= MAP_WIDTH || r >= MAP_HEIGHT) {
      return null;
    }
    return this.tiles[r]![q]!;
  }

  private centerMap(): void {
    const centerQ = (MAP_WIDTH - 1) / 2;
    const centerR = (MAP_HEIGHT - 1) / 2;
    const center = GridCoords.gridToWorld(centerQ, centerR);
    this.group.position.set(-center.x, 0, -center.z);
  }
}
