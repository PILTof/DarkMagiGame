import type { Object3D } from "three";
import * as THREE from "three";
import type { CommandDispatcher } from "../commands/CommandDispatcher.ts";
import type { MoveUnitCommand } from "../commands/contracts/MoveUnitCommand.ts";
import type { EventBus } from "../core/EventBus";
import type { Engine } from "../engine/Engine";
import type { IsometricCamera } from "../engine/IsometricCamera";
import type { Entity } from "../entities/Entity";
import { EntityManager } from "../entities/EntityManager";
import { Player } from "../entities/Player";
import type { Unit } from "../entities/Unit";
import { GridCoords, type GridPos } from "../world/GridCoords";
import { TileMap } from "../world/TileMap";
import { UnitBoundsTile } from "../world/tiles/UnitBoundsTile";
import { HitTarget } from "./DTOs/HitTarget";
import type { System } from "./System";
import { PlayerCombat } from "./contracts/EventNamesInterface";

export type BoundModifiers = {
    armor?: number;
    mana_pool?: number;
    stamina?: number;
};

export class BoundsSystem implements System {
    private readonly tileMap: TileMap;
    private readonly commandDispatcher: CommandDispatcher;
    private readonly boundYPos: number = 0.03;
    private readonly eventBus: EventBus;
    private readonly raycaster = new THREE.Raycaster();
    private readonly pointer = new THREE.Vector2();
    private readonly engine: Engine;
    private readonly camera: IsometricCamera;
    private readonly entityManager: EntityManager;
    private readonly player: Player | undefined;

    public action: {
        target: HitTarget | null;
        run: boolean;
    } = {
        target: null,
        run: false,
    };

    constructor(
        tileMap: TileMap,
        commandDispatcher: CommandDispatcher,
        eventBus: EventBus,
        engine: Engine,
        camera: IsometricCamera,
        entityManager: EntityManager,
    ) {
        this.tileMap = tileMap;
        this.commandDispatcher = commandDispatcher;
        this.eventBus = eventBus;
        this.engine = engine;
        this.camera = camera;
        this.entityManager = entityManager;

        
        this.player = this.entityManager.getPlayer();

        if (this.player) {
            this.eventBus.on(PlayerCombat.target_requested, (payload) => {
                this.handleTargetRequest(payload as {
                    event: PointerEvent;
                    target: { worldPosition: THREE.Vector3 };
                });
            });
        }


        this.entityManager.getAll().forEach((entity) => {
            this.drawBounds(entity);
        });
    }

    public getBoundAtGrid(unit: Unit, grid: GridPos): HitTarget | null {
        return this.getBoundsAtGrids(unit, [grid])[0] ?? null;
    }

    public getBoundsAtGrids(unit: Unit, grids: Iterable<GridPos>): HitTarget[] {
        const gridKeys = new Set(
            Array.from(grids, (grid) => this.getGridKey(grid)),
        );
        const bounds: HitTarget[] = [];

        unit.mesh.traverse((object) => {
            if (object.userData.isBound !== true) return;
            const boundGrid = object.userData.grid as GridPos | undefined;
            if (boundGrid && gridKeys.has(this.getGridKey(boundGrid))) {
                bounds.push(new HitTarget(object, this.entityManager));
            }
        });

        return bounds;
    }

    private handleTargetRequest(payload: {
        event: PointerEvent;
        target: { worldPosition: THREE.Vector3 };
    }): void {
        const enemyBound = this.pickEnemyBound(payload.event);
        if (!enemyBound) {
            this.action.run = false;
            this.action.target = null;
            
            // Dispatch MoveUnitCommand вместо события
            const targetGrid = this.tileMap.worldToGrid(payload.target.worldPosition);
            const command: MoveUnitCommand = {
                unitId: "player",
                targetGrid,
                targetWorldX: payload.target.worldPosition.x,
                targetWorldZ: payload.target.worldPosition.z,
            };
            this.commandDispatcher.dispatchMoveUnit(command);
            return;
        }

        if (!this.player) return;
        this.action.target = enemyBound;
        this.action.run = true;
        this.checkHit(this.player);

        // Если цель вне радиуса, путь назначается один раз. update() далее
        // отслеживает только вход в радиус и запускает единственную атаку.
        if (this.action.run) {
            const targetGrid = enemyBound.entityGridPos;
            if (!targetGrid) {
                this.action.run = false;
                this.action.target = null;
                return;
            }
            
            const targetWorld = this.tileMap.gridToWorldPosition(targetGrid.q, targetGrid.r);
            const command: MoveUnitCommand = {
                unitId: "player",
                targetGrid,
                targetWorldX: targetWorld.x,
                targetWorldZ: targetWorld.z,
            };
            this.commandDispatcher.dispatchMoveUnit(command);
        }
    }

    private checkHit(sniper: Player) {
        // Сначала проверяем клик на баунд врага
        if (this.action.target) {
            const sniperGridPos = this.tileMap.worldToGrid(sniper.position);
            // Если не удалось вычислить расстояние (например, нет игрока), останавливаем
            if (this.action.target.getGridDistance(sniperGridPos) === undefined) {
                sniper.clearPath();
                this.action.run = false;
                this.action.target = null;
                return;
            }

            if (this.action.target.getGridDistance(sniperGridPos) <= Player.interactionDistance) {
                sniper.clearPath();
                this.eventBus.emit(PlayerCombat.click_target, {target: this.action.target, sniper: sniper})
                this.action.run = false;
                this.action.target = null;
            } else {
                
            }
        } else {
            this.action.run = false;
        }
    }

    update(_dt: number): void {
        if (this.action.run && this.action.target && this.player) {
            this.checkHit(this.player);
        }
    }

    /**
     * Возвращает СУЩНОСТЬ по которой произошел клик.
     * @param event 
     * @returns HitTarget | null
     */
    private pickEnemyBound(event: PointerEvent): HitTarget | null {
        const rect = this.engine.renderer.domElement.getBoundingClientRect();
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera.camera);

        // Получаем все сущности и проверяем их баунды
        const entities = this.entityManager.getAll();

        for (const entity of entities) {
            // Пропускаем игрока
            if (entity.id === "player") continue;

            // Проверяем пересечение с mesh сущности (включая все дочерние объекты)
            const hits = this.raycaster.intersectObject(entity.mesh, true);

            for (const hit of hits) {
                // Ищем баунд в иерархии
                const bound = this.findBound(hit.object);
                if (bound && bound.userData.isBound) {
                    return new HitTarget(bound, this.entityManager);
                }
            }
        }

        return null;
    }

    /**
     * Ищет объект с userData.isBound === true в иерархии
     */
    private findBound(object: THREE.Object3D): THREE.Object3D | null {
        let current: THREE.Object3D | null = object;
        while (current) {
            if (current.userData.isBound === true) return current;
            current = current.parent;
        }
        return null;
    }

    /**
     * Рисует области контакта для каждой сущности (WIP разные для разных сущностей)
     * @param entity 
     */
    private drawBounds(entity: Entity): void {
        const currentGrid = this.tileMap.worldToGrid(entity.position);
        const neighborTiles = GridCoords.neighbors(
            currentGrid.q,
            currentGrid.r,
        );

        neighborTiles.forEach((tile) => {
            const {
                x: wx,
                z: wz,
            } = this.tileMap.gridToWorldPosition(tile.q, tile.r);
            const lx = entity.position.x - wx;
            const lz = entity.position.z - wz;

            this.makeBound(lx, this.boundYPos, lz, entity, tile).then((mesh) => {
                mesh.userData.modifiers = {
                    armor: 5,
                };
                entity.mesh.add(mesh);
            });
        });

        this.makeBound(0, this.boundYPos, 0, entity, currentGrid).then((mesh) => {
            mesh.userData.modifiers = {
                armor: 50,
            };
            entity.mesh.add(mesh);
        });
    }

    /**
     * Создание баунда 
     * @param x - относительно сущности
     * @param y - относительно сущности
     * @param z - относительно сущности
     * @param entity - сущность
     * @returns 
     */
    private getGridKey(grid: GridPos): string {
        return `${grid.q},${grid.r}`;
    }

    private async makeBound(
        x: number,
        y: number,
        z: number,
        entity: Entity,
        grid: GridPos,
    ): Promise<Object3D> {
        const bound = new UnitBoundsTile({ q: 0, r: 0 });
        const mesh = await bound.loadMesh();
        mesh.position.set(x, y, z);

        // Добавляем метаданные для идентификации баунда
        mesh.userData = {
            type: "bound",
            entityId: entity.id,
            grid,
            isBound: true,
        };

        return mesh;
    }
}
