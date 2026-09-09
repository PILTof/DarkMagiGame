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
    health_points?: number,
    mana_pool?: number,
    stamina?: number
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

        this.eventBus.on("player:move-to", (payload) => this.checkHit(payload));

        this.entityManager.getAll().forEach((entity) => {
            this.drawBounds(entity);
        });
    }

    private checkHit(payload: { event: PointerEvent }) {
        // Сначала проверяем клик на баунд врага
        const boundHit = this.pickEnemyBound(payload.event);
        if (boundHit) {
            console.log(boundHit);
            this.eventBus.emit("player:move-stop", {});
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
        modifiers: BoundModifiers
    } | null {
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
                    const gridPos = this.tileMap.worldToGrid(bound.position);

                    return {
                        entityId: bound.userData.entityId,
                        gridPos: gridPos,
                        position: bound.position,
                        mesh: bound,
                        modifiers: {
                            health_points: bound.userData.hpModifier
                        }
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
                mesh.userData.hpModifier = 5;
                entity.mesh.add(mesh);
            });
        });

        this.makeBound(0, this.boundYPos, 0, entity).then((mesh) => {
            mesh.userData.hpModifier = 5;
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

    update(dt: number): void {
        // throw new Error("Method not implemented.");
    }
}
