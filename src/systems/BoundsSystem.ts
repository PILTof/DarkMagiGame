import type { Object3D } from "three";
import * as THREE from "three";
import type { EventBus } from "../core/EventBus";
import type { Engine } from "../engine/Engine";
import type { IsometricCamera } from "../engine/IsometricCamera";
import type { Entity } from "../entities/Entity";
import type { EntityManager } from "../entities/EntityManager";
import { GridCoords, type GridPos } from "../world/GridCoords";
import type { TileMap } from "../world/TileMap";
import { UnitBoundsTile } from "../world/tiles/UnitBoundsTile";
import type { System } from "./System";

export type BoundModifiers = {
    health_points?: number;
    mana_pool?: number;
    stamina?: number;
};

export class BoundsSystem implements System {
    private readonly entityManager: EntityManager;
    private readonly tileMap: TileMap;
    private readonly boundYPos: number = 0.03;
    private readonly eventBus: EventBus;
    private readonly raycaster = new THREE.Raycaster();
    private readonly pointer = new THREE.Vector2();
    private readonly engine: Engine;
    private readonly camera: IsometricCamera;
    public action: {
        payload: any;
        run: boolean;
    } = {
        payload: undefined,
        run: false,
    };

    constructor(
        entityManager: EntityManager,
        tileMap: TileMap,
        eventBus: EventBus,
        engine: Engine,
        camera: IsometricCamera,
    ) {
        this.entityManager = entityManager;
        this.tileMap = tileMap;
        this.eventBus = eventBus;
        this.engine = engine;
        this.camera = camera;

        this.eventBus.on("player:move-to", (payload) => {
            this.action.payload = payload;
            this.action.run = true;
            this.checkHit(payload);
        });

        this.entityManager.getAll().forEach((entity) => {
            this.drawBounds(entity);
        });
    }

    private checkHit(payload: any) {
        // Сначала проверяем клик на баунд врага
        const boundHit = this.pickEnemyBound(payload.event);
        if (boundHit) {
            console.log('Bound hit detected:', {
                entityId: boundHit.entityId,
                gridDistance: boundHit.gridDistance,
                distance: boundHit.distance
            });

            // Если не удалось вычислить расстояние (например, нет игрока), останавливаем
            if (boundHit.gridDistance === undefined) {
                console.log('Grid distance undefined, stopping movement');
                this.eventBus.emit("player:move-stop", {});
                this.action.run = false;
                return;
            }

            // Если расстояние <= 2 гекса, останавливаем игрока (он достаточно близко для атаки)
            if (boundHit.gridDistance <= 2) {
                console.log(`Grid distance ${boundHit.gridDistance} <= 2, stopping movement`);
                this.eventBus.emit("player:move-stop", {});
                this.action.run = false;
            } else {
                console.log(`Grid distance ${boundHit.gridDistance} > 2, continuing movement`);
                // Игрок продолжает двигаться к цели
            }
        }
    }

    update(dt: number): void {
        if (this.action.run) {
            this.checkHit(this.action.payload);
        }
    }

    /**
     * Проверяет, попал ли клик на баунд врага
     * @returns объект с entityId если попали на баунд врага, иначе null
     */
    private pickEnemyBound(event: PointerEvent): {
        entityId: string;
        gridPos: GridPos;
        position: THREE.Vector3Like;
        mesh: Object3D;
        modifiers: BoundModifiers;
        distance: number | undefined;
        gridDistance: number | undefined;
    } | null {
        const rect = this.engine.renderer.domElement.getBoundingClientRect();
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera.camera);

        // Получаем все сущности и проверяем их баунды
        const entities = this.entityManager.getAll();
        const player = this.entityManager.getPlayer();

        for (const entity of entities) {
            // Пропускаем игрока
            if (entity.id === "player") continue;

            // Проверяем пересечение с mesh сущности (включая все дочерние объекты)
            const hits = this.raycaster.intersectObject(entity.mesh, true);

            for (const hit of hits) {
                // Ищем баунд в иерархии
                const bound = this.findBound(hit.object);
                if (bound && bound.userData.isBound) {
                    const entity = this.entityManager.get(bound.userData.entityId);
                    
                    // ВАЖНО: используем позицию СУЩНОСТИ, а не баунда, 
                    // так как баунды имеют локальные смещения относительно сущности
                    const entityGridPos = entity ? this.tileMap.worldToGrid(entity.position) : this.tileMap.worldToGrid(bound.position);
                    
                    let distance: number | undefined = undefined;
                    let gridDistance: number | undefined = undefined;
                    
                    if (player && entity) {
                        distance = player.position.distanceTo(entity.position);
                        const playerGridPos = this.tileMap.worldToGrid(player.position);
                        gridDistance = GridCoords.distance(playerGridPos, entityGridPos);
                        console.log('Grid distance calculated:', {
                            playerGrid: playerGridPos,
                            entityGrid: entityGridPos,
                            distance: gridDistance,
                            entityId: entity.id
                        });
                    }

                    return {
                        entityId: bound.userData.entityId,
                        gridPos: entityGridPos,
                        position: entity ? entity.position : bound.position,
                        distance: distance,
                        gridDistance: gridDistance,
                        mesh: bound,
                        modifiers: {
                            health_points: bound.userData.hpModifier,
                        },
                    };
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

    private drawBounds(entity: Entity): void {
        const currentGrid = this.tileMap.worldToGrid(entity.position);
        const neighborTiles = GridCoords.neighbors(
            currentGrid.q,
            currentGrid.r,
        );

        neighborTiles.forEach((tile) => {
            const {
                x: wx,
                y: wy,
                z: wz,
            } = this.tileMap.gridToWorldPosition(tile.q, tile.r);
            const lx = entity.position.x - wx;
            const lz = entity.position.z - wz;

            this.makeBound(lx, this.boundYPos, lz, entity).then((mesh) => {
                mesh.userData.modifiers = {
                    health_points: 5,
                };
                entity.mesh.add(mesh);
            });
        });

        this.makeBound(0, this.boundYPos, 0, entity).then((mesh) => {
            mesh.userData.modifiers = {
                health_points: 10,
            };
            entity.mesh.add(mesh);
        });
    }

    private async makeBound(
        x: number,
        y: number,
        z: number,
        entity: Entity,
    ): Promise<Object3D> {
        const bound = new UnitBoundsTile({ q: 0, r: 0 });
        const mesh = await bound.loadMesh();
        mesh.position.set(x, y, z);

        // Добавляем метаданные для идентификации баунда
        mesh.userData = {
            type: "bound",
            entityId: entity.id,
            isBound: true,
        };

        return mesh;
    }
}
