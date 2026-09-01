import * as THREE from "three";
import { TILE_SIZE } from "../config/gameConfig.ts";
import { GridCoords, type GridPos } from "./GridCoords.ts";
import type { TileMap } from "./TileMap.ts";

type Node = {
  pos: GridPos;
  g: number;
  f: number;
};

export type PathResult = {
  path: GridPos[];
  reachesGoal: boolean;
};

export class PathfindingService {
  private readonly tileMap: TileMap;

  constructor(tileMap: TileMap) {
    this.tileMap = tileMap;
  }

  /** Прямой путь без непроходимых гексов на линии. */
  canWalkDirect(from: THREE.Vector3, to: THREE.Vector3): boolean {
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const distance = Math.hypot(dx, dz);
    if (distance < 0.001) return true;

    const steps = Math.max(1, Math.ceil(distance / (TILE_SIZE / 3)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const sample = new THREE.Vector3(from.x + dx * t, from.y, from.z + dz * t);
      const grid = this.tileMap.worldToGrid(sample);
      const tile = this.tileMap.getTile(grid.q, grid.r);
      if (!tile?.walkable) return false;
    }
    return true;
  }

  findPath(from: GridPos, to: GridPos): GridPos[] {
    return this.findPathToward(from, to).path;
  }

  /**
   * Полный путь до цели или максимально близкий путь к непроходимому/недостижимому гексу.
   */
  findPathToward(from: GridPos, to: GridPos): PathResult {
    const goalWalkable = this.tileMap.getTile(to.q, to.r)?.walkable ?? false;

    if (from.q === to.q && from.r === to.r) {
      return { path: [], reachesGoal: goalWalkable };
    }

    if (goalWalkable) {
      const fullPath = this.searchPath(from, to, true);
      if (fullPath) {
        return { path: fullPath, reachesGoal: true };
      }
    }

    const closestPath = this.searchClosestPath(from, to);
    if (!closestPath) {
      return { path: [], reachesGoal: false };
    }

    return { path: closestPath, reachesGoal: false };
  }

  private searchPath(from: GridPos, to: GridPos, requireGoal: boolean): GridPos[] | null {
    const goalKey = this.key(to);
    const startKey = this.key(from);
    const open: Node[] = [{ pos: from, g: 0, f: GridCoords.distance(from, to) }];
    const openSet = new Set<string>([startKey]);
    const cameFrom = new Map<string, GridPos>();
    const gScore = new Map<string, number>([[startKey, 0]]);

    while (open.length > 0) {
      open.sort((a, b) => a.f - b.f);
      const current = open.shift()!;
      const currentKey = this.key(current.pos);

      if (requireGoal && currentKey === goalKey) {
        return this.reconstructPath(cameFrom, current.pos);
      }

      openSet.delete(currentKey);

      for (const neighbor of GridCoords.neighbors(current.pos.q, current.pos.r)) {
        const tile = this.tileMap.getTile(neighbor.q, neighbor.r);
        if (!tile?.walkable) continue;

        const neighborKey = this.key(neighbor);
        const tentativeG = current.g + 1;

        if (tentativeG >= (gScore.get(neighborKey) ?? Infinity)) {
          continue;
        }

        cameFrom.set(neighborKey, current.pos);
        gScore.set(neighborKey, tentativeG);

        if (!openSet.has(neighborKey)) {
          open.push({
            pos: neighbor,
            g: tentativeG,
            f: tentativeG + GridCoords.distance(neighbor, to),
          });
          openSet.add(neighborKey);
        }
      }
    }

    return null;
  }

  private searchClosestPath(from: GridPos, to: GridPos): GridPos[] | null {
    let closest = from;
    let closestDist = GridCoords.distance(from, to);

    const startKey = this.key(from);
    const open: Node[] = [{ pos: from, g: 0, f: GridCoords.distance(from, to) }];
    const openSet = new Set<string>([startKey]);
    const cameFrom = new Map<string, GridPos>();
    const gScore = new Map<string, number>([[startKey, 0]]);
    const closed = new Set<string>();

    while (open.length > 0) {
      open.sort((a, b) => a.f - b.f);
      const current = open.shift()!;
      const currentKey = this.key(current.pos);

      if (closed.has(currentKey)) continue;
      closed.add(currentKey);

      const dist = GridCoords.distance(current.pos, to);
      if (dist < closestDist) {
        closestDist = dist;
        closest = current.pos;
      }

      for (const neighbor of GridCoords.neighbors(current.pos.q, current.pos.r)) {
        const tile = this.tileMap.getTile(neighbor.q, neighbor.r);
        if (!tile?.walkable) continue;

        const neighborKey = this.key(neighbor);
        if (closed.has(neighborKey)) continue;

        const tentativeG = current.g + 1;

        if (tentativeG >= (gScore.get(neighborKey) ?? Infinity)) {
          continue;
        }

        cameFrom.set(neighborKey, current.pos);
        gScore.set(neighborKey, tentativeG);

        if (!openSet.has(neighborKey)) {
          open.push({
            pos: neighbor,
            g: tentativeG,
            f: tentativeG + GridCoords.distance(neighbor, to),
          });
          openSet.add(neighborKey);
        }
      }
    }

    if (closest.q === from.q && closest.r === from.r) {
      return null;
    }

    return this.reconstructPath(cameFrom, closest);
  }

  private reconstructPath(
    cameFrom: Map<string, GridPos>,
    current: GridPos,
  ): GridPos[] {
    const path: GridPos[] = [current];
    let key = this.key(current);

    while (cameFrom.has(key)) {
      const prev = cameFrom.get(key)!;
      path.unshift(prev);
      key = this.key(prev);
    }

    path.shift();
    return path;
  }

  private key(pos: GridPos): string {
    return `${pos.q},${pos.r}`;
  }
}
