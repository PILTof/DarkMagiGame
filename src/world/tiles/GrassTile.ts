import type { TileVisualConfig } from "./Tile.ts";
import { Tile } from "./Tile.ts";

export class GrassTile extends Tile {
  readonly type = "grass" as const;
  readonly walkable = true;

  protected getVisualConfig(): TileVisualConfig {
    return {
      color: 0x4a7c59,
      roughness: 0.85,
      metalness: 0,
      height: 0.2,
      texture: null,
    };
  }
}
