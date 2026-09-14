import * as THREE from "three";
import type { MoveUnitCommand } from "../commands/contracts/MoveUnitCommand.ts";
import type { StopUnitCommand } from "../commands/contracts/StopUnitCommand.ts";
import type { EventBus } from "../core/EventBus.ts";
import type { EntityManager } from "../entities/EntityManager.ts";
import type { GridPos } from "../world/GridCoords.ts";
import type { HexGrid } from "../world/hex/HexGrid.ts";
import type { PathfindingService } from "../world/PathfindingService.ts";
import type { TileMap } from "../world/TileMap.ts";
import type { System } from "./System.ts";

export class MovementSystem implements System {
    private readonly entityManager: EntityManager;
    private readonly pathfinding: PathfindingService;
    private readonly tileMap: TileMap;
    private readonly hexGrid: HexGrid;
    private readonly eventBus: EventBus;

    constructor(
        entityManager: EntityManager,
        pathfinding: PathfindingService,
        tileMap: TileMap,
        hexGrid: HexGrid,
        eventBus: EventBus,
    ) {
        this.entityManager = entityManager;
        this.pathfinding = pathfinding;
        this.tileMap = tileMap;
        this.hexGrid = hexGrid;
        this.eventBus = eventBus;
    }

    /** Command handler: выполняет команду перемещения юнита. */
    handleMoveUnit(command: MoveUnitCommand): void {
        const player = this.entityManager.getPlayer();
        if (!player) return;

        const moveY = player.position.y;
        const targetWorld = new THREE.Vector3(command.targetWorldX, moveY, command.targetWorldZ);
        const startPos = player.position.clone();
        const startGrid = this.tileMap.worldToGrid(startPos);
        const targetGrid = command.targetGrid;
        const targetWalkable = this.hexGrid.isWalkable(targetGrid.q, targetGrid.r);

        if (
            targetWalkable &&
            this.pathfinding.canWalkDirect(startPos, targetWorld)
        ) {
            player.setWorldPath([targetWorld.clone()]);
            this.eventBus.emit("unit:moved", {
                unitId: command.unitId,
                fromGrid: startGrid,
                toGrid: targetGrid,
            });
            return;
        }

        const result = this.pathfinding.findPathToward(startGrid, targetGrid);

        if (result.path.length === 0) {
            if (result.reachesGoal && targetWalkable) {
                player.setWorldPath([targetWorld.clone()]);
                this.eventBus.emit("unit:moved", {
                    unitId: command.unitId,
                    fromGrid: startGrid,
                    toGrid: targetGrid,
                });
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
        
        this.eventBus.emit("unit:moved", {
            unitId: command.unitId,
            fromGrid: startGrid,
            toGrid: targetGrid,
        });
    }

    /** Command handler: останавливает юнит. */
    handleStopUnit(command: StopUnitCommand): void {
        const player = this.entityManager.getPlayer();
        if (!player) return;
        
        player.clearPath();
        const currentGrid = this.tileMap.worldToGrid(player.position);
        
        this.eventBus.emit("unit:stopped", {
            unitId: command.unitId,
            atGrid: currentGrid,
        });
    }

    update(dt: number): void {
        const player = this.entityManager.getPlayer();
        if (!player?.hasPath()) return;

        const target = player.worldPath[0]!;
        const position = player.position;
        const direction = new THREE.Vector3(
            target.x - position.x,
            0,
            target.z - position.z,
        );
        const distance = direction.length();
        const step = player.speed * dt;

        if (distance <= step) {
            // Достигли waypoint
            position.set(target.x, position.y, target.z);
            player.syncMeshPosition();
            player.worldPath.shift();
            
            const newGrid = this.tileMap.worldToGrid(position);
            this.eventBus.emit("unit:reached-waypoint", {
                unitId: "player",
                waypointGrid: newGrid,
            });
            
            if (!player.hasPath()) {
                player.gridPos = newGrid;
            }
            return;
        }

        // Перемещаем сущность
        direction.normalize().multiplyScalar(step);
        position.add(direction);
        player.syncMeshPosition();
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
