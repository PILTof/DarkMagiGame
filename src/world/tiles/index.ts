import type { GridPos } from "../GridCoords.ts";
import { GrassTile } from "./GrassTile.ts";
import { StoneTile } from "./StoneTile.ts";
import { Tile, type TileType } from "./Tile.ts";
import { WaterTile } from "./WaterTile.ts";

export function createTile(type: TileType, pos: GridPos): Tile {
  switch (type) {
    case "grass":
      return new GrassTile(pos);
    case "stone":
      return new StoneTile(pos);
    case "water":
      return new WaterTile(pos);
  }
}

export function resolveTileType(q: number, r: number): TileType {
  if ((q + r) % 7 === 0) return "water";
  if ((q + r) % 5 === 0) return "stone";
  return "grass";
}

export { Tile, type TileType };
export { GrassTile } from "./GrassTile.ts";
export { StoneTile } from "./StoneTile.ts";
export { WaterTile } from "./WaterTile.ts";
