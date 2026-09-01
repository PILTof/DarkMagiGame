import * as THREE from "three";
import type { EventBus } from "../core/EventBus.ts";
import type { EntityManager } from "../entities/EntityManager.ts";
import type { GridPos } from "../world/GridCoords.ts";
import type { PathfindingService } from "../world/PathfindingService.ts";
import type { TileMap } from "../world/TileMap.ts";
import type { PlayerMovePayload } from "./InputSystem.ts";
import type { System } from "./System.ts";

export class MovementSystem implements System {
  private readonly entityManager: EntityManager;
  private readonly pathfinding: PathfindingService;
  private readonly tileMap: TileMap;
  private readonly eventBus: EventBus;

  constructor(
    entityManager: EntityManager,
    pathfinding: PathfindingService,
    tileMap: TileMap,
    eventBus: EventBus,
  ) {
    this.entityManager = entityManager;
    this.pathfinding = pathfinding;
    this.tileMap = tileMap;
    this.eventBus = eventBus;
    this.eventBus.on("player:move-to", (payload) => {
      this.onPlayerMoveTo(payload);
    });
  }

  update(dt: number): void {
    const player = this.entityManager.getPlayer();
    if (!player?.hasPath()) return;

    const target = player.worldPath[0]!;
    const position = player.mesh.position;
    const direction = new THREE.Vector3(
      target.x - position.x,
      0,
      target.z - position.z,
    );
    const distance = direction.length();
    const step = player.speed * dt;

    if (distance <= step) {
      position.set(target.x, position.y, target.z);
      player.worldPath.shift();
      if (!player.hasPath()) {
        player.gridPos = this.tileMap.worldToGrid(position);
      }
      return;
    }

    direction.normalize().multiplyScalar(step);
    position.add(direction);
  }

  private onPlayerMoveTo(payload: unknown): void {
    const { x, z } = payload as PlayerMovePayload;
    const player = this.entityManager.getPlayer();
    if (!player) return;

    const moveY = player.mesh.position.y;
    const targetWorld = new THREE.Vector3(x, moveY, z);
    const startPos = player.mesh.position.clone();
    const startGrid = this.tileMap.worldToGrid(startPos);
    const targetGrid = this.tileMap.worldToGrid(new THREE.Vector3(x, 0, z));
    const targetWalkable =
      this.tileMap.getTile(targetGrid.q, targetGrid.r)?.walkable ?? false;

    if (
      targetWalkable &&
      this.pathfinding.canWalkDirect(startPos, targetWorld)
    ) {
      player.setWorldPath([targetWorld.clone()]);
      return;
    }

    const result = this.pathfinding.findPathToward(startGrid, targetGrid);

    if (result.path.length === 0) {
      if (result.reachesGoal && targetWalkable) {
        player.setWorldPath([targetWorld.clone()]);
      }
      return;
    }

    const finalTarget = result.reachesGoal
      ? targetWorld.clone()
      : this.tileMap.gridToWorldPosition(
          result.path[result.path.length - 1]!.q,
          result.path[result.path.length - 1]!.r,
          moveY,
        );

    const gridSteps = result.reachesGoal
      ? result.path
      : result.path.slice(0, -1);

    player.setWorldPath(this.buildWorldPath(gridSteps, finalTarget, moveY));
  }

  private buildWorldPath(
    gridPath: GridPos[],
    target: THREE.Vector3,
    y: number,
  ): THREE.Vector3[] {
    const worldPath: THREE.Vector3[] = [];

    for (const pos of gridPath) {
      worldPath.push(this.tileMap.gridToWorldPosition(pos.q, pos.r, y));
    }

    worldPath.push(target.clone());
    return worldPath;
  }
}
