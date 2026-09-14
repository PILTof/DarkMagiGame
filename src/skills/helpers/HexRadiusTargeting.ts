import { GridCoords, type GridPos } from "../../world/GridCoords.ts";
import type { TileMap } from "../../world/TileMap.ts";

export function getHexRadiusAffectedCells(
  tileMap: TileMap,
  center: GridPos,
  radius: number,
): GridPos[] {
  const cells: GridPos[] = [];

  for (let r = 0; r < tileMap.height; r++) {
    for (let q = 0; q < tileMap.width; q++) {
      const cell = { q, r };
      if (GridCoords.distance(center, cell) <= radius) {
        cells.push(cell);
      }
    }
  }

  return cells;
}
