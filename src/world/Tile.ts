import type { GridPos } from "./GridCoords.ts";

export type TileType = "grass" | "stone" | "water";

export class Tile {
  readonly pos: GridPos;
  readonly type: TileType;
  readonly walkable: boolean;

  constructor(pos: GridPos, type: TileType, walkable: boolean) {
    this.pos = pos;
    this.type = type;
    this.walkable = walkable;
  }
}
