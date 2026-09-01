import type { GridPos } from "../GridCoords.ts";
import { DirtTile } from "./DirtTile.ts";
import { GrassTile } from "./GrassTile.ts";
import { Tile, type TileType } from "./Tile.ts";
import { WaterTile } from "./WaterTile.ts";

export function createTile(type: TileType, pos: GridPos): Tile {
  switch (type) {
    case "grass":
      return new GrassTile(pos);
    case "stone":
      return new DirtTile(pos);
    case "water":
      return new WaterTile(pos);
  }
}

export function resolveTileType(q: number, r: number): TileType {
  if ((q + r) % 7 === 0) return "water";
  if ((q + r) % 5 === 0) return "stone";
  return "grass";
}

export { DirtTile as StoneTile } from "./DirtTile.ts";
export { GrassTile } from "./GrassTile.ts";
export { WaterTile } from "./WaterTile.ts";
export { Tile, type TileType };

