import type { GridPos } from "./GridCoords.ts";
import type { TileMap } from "./TileMap.ts";

export class PathfindingService {
  private readonly tileMap: TileMap;

  constructor(tileMap: TileMap) {
    this.tileMap = tileMap;
  }

  findPath(_from: GridPos, _to: GridPos): GridPos[] {
    void this.tileMap;
    // TODO: интеграция three-pathfinding
    return [];
  }
}
