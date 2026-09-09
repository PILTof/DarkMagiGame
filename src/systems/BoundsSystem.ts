import type { Object3D } from "three";
import * as THREE from "three";
import type { EventBus } from "../core/EventBus";
import type { Engine } from "../engine/Engine";
import type { IsometricCamera } from "../engine/IsometricCamera";
import type { Entity } from "../entities/Entity";
import { EntityManager } from "../entities/EntityManager";
import { Player } from "../entities/Player";
import { GridCoords } from "../world/GridCoords";
import { TileMap } from "../world/TileMap";
import { UnitBoundsTile } from "../world/tiles/UnitBoundsTile";
import { HitTarget } from "./DTOs/HitTarget";
import type { System } from "./System";

export type BoundModifiers = {
    health_points?: number;
    mana_pool?: number;
    stamina?: number;
};

export class BoundsSystem implements System {
    private readonly tileMap: TileMap;
    private readonly boundYPos: number = 0.03;
    private readonly eventBus: EventBus;
    private readonly raycaster = new THREE.Raycaster();
    private readonly pointer = new THREE.Vector2();
    private readonly engine: Engine;
    private readonly camera: IsometricCamera;
    private readonly player: Entity | any;

    public action: {
        target: HitTarget | null;
        run: boolean;
    } = {
        target: null,
        run: false,
    };

    constructor(
        tileMap: TileMap,
        eventBus: EventBus,
        engine: Engine,
        camera: IsometricCamera,
    ) {
        this.tileMap = tileMap;
        this.eventBus = eventBus;
        this.engine = engine;
        this.camera = camera;

        
        this.player = EntityManager.getInstance().getPlayer();

        if (this.player) {
            this.eventBus.on("player:move-to", (payload: any) => {
                this.action.run = true;
                this.action.target = this.pickEnemyBound(payload.event);
                this.checkHit(this.player);
            });
        }


        EntityManager.getInstance().getAll().forEach((entity) => {
            this.drawBounds(entity);
        });
    }

    private checkHit(sniper: Entity) {
        // Сначала проверяем клик на баунд врага
        if (this.action.target) {
            const sniperGridPos = this.tileMap.worldToGrid(sniper.position);
            // Если не удалось вычислить расстояние (например, нет игрока), останавливаем
            if (this.action.target.getGridDistance(sniperGridPos) === undefined) {
                this.eventBus.emit("player:move-stop", {});
                this.action.run = false;
                this.action.target;
                return;
            }

            if (this.action.target.getGridDistance(sniperGridPos) <= Player.interactionDistance) {
                this.eventBus.emit("player:move-stop", {});
                this.action.run = false;
                this.action.target = null;
            } else {
                
            }
        } else {
            this.action.run = false;
        }
    }

    update(dt: number): void {
        if (this.action.run && this.action.target) {
            this.checkHit(this.player);
        }
    }

    /**
     * Проверяет, попал ли клик на баунд врага
     * @returns объект с entityId если попали на баунд врага, иначе null
     */
    private pickEnemyBound(event: PointerEvent): HitTarget | null {
        const rect = this.engine.renderer.domElement.getBoundingClientRect();
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera.camera);

        // Получаем все сущности и проверяем их баунды
        const entities = EntityManager.getInstance().getAll();

        for (const entity of entities) {
            // Пропускаем игрока
            if (entity.id === "player") continue;

            // Проверяем пересечение с mesh сущности (включая все дочерние объекты)
            const hits = this.raycaster.intersectObject(entity.mesh, true);

            for (const hit of hits) {
                // Ищем баунд в иерархии
                const bound = this.findBound(hit.object);
                if (bound && bound.userData.isBound) {
                    return new HitTarget(bound);
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
