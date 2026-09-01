import * as THREE from "three";
import { MAP_HEIGHT, MAP_WIDTH, TILE_SIZE } from "../config/gameConfig.ts";
import { GridCoords } from "./GridCoords.ts";
import { Tile, type TileType } from "./Tile.ts";

const TILE_COLORS: Record<TileType, number> = {
  grass: 0x4a7c59,
  stone: 0x6b6b6b,
  water: 0x3d6b8e,
};

export class TileMap {
  readonly group = new THREE.Group();
  readonly tiles: Tile[][] = [];
  private readonly scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.group);
  }

  build(): void {
    const geometry = new THREE.BoxGeometry(TILE_SIZE, 0.2, TILE_SIZE);

    for (let gy = 0; gy < MAP_HEIGHT; gy++) {
      const row: Tile[] = [];
      for (let gx = 0; gx < MAP_WIDTH; gx++) {
        const type: TileType =
          (gx + gy) % 7 === 0
            ? "water"
            : (gx + gy) % 5 === 0
              ? "stone"
              : "grass";
        const walkable = type !== "water";
        const tile = new Tile({ gx, gy }, type, walkable);
        row.push(tile);

        const material = new THREE.MeshStandardMaterial({
          color: TILE_COLORS[type],
        });
        const mesh = new THREE.Mesh(geometry, material);
        const worldPos = GridCoords.gridToWorld(gx, gy);
        mesh.position.set(worldPos.x, -0.1, worldPos.z);
        mesh.userData = { gx, gy, type: "tile" };
        this.group.add(mesh);
      }
      this.tiles.push(row);
    }

    this.group.position.set(
      -(MAP_WIDTH * TILE_SIZE) / 2 + TILE_SIZE / 2,
      0,
      -(MAP_HEIGHT * TILE_SIZE) / 2 + TILE_SIZE / 2,
    );
  }

  getTile(gx: number, gy: number): Tile | null {
    if (gx < 0 || gy < 0 || gx >= MAP_WIDTH || gy >= MAP_HEIGHT) {
      return null;
    }
    return this.tiles[gy]![gx]!;
  }
}
