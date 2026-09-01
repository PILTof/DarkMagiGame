import type { TileVisualConfig } from "./Tile.ts";
import { Tile } from "./Tile.ts";

export class WaterTile extends Tile {
  readonly type = "water" as const;
  readonly walkable = false;

  protected getVisualConfig(): TileVisualConfig {
    return {
      color: 0x3d6b8e,
      roughness: 0.2,
      metalness: 0.1,
      height: 0.15,
      texture: null,
    };
  }
}
