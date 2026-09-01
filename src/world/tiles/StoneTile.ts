import type { TileVisualConfig } from "./Tile.ts";
import { Tile } from "./Tile.ts";

export class StoneTile extends Tile {
  readonly type = "stone" as const;
  readonly walkable = true;

  protected getVisualConfig(): TileVisualConfig {
    return {
      color: 0x6b6b6b,
      roughness: 0.7,
      metalness: 0.05,
      height: 0.22,
      texture: null,
    };
  }
}
