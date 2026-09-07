import { TILE_SIZE } from "../config/gameConfig";
import type { Entity } from "../entities/Entity";
import type { EntityManager } from "../entities/EntityManager";
import type { TileMap } from "../world/TileMap";
import { UnitBoundsTile } from "../world/tiles/UnitBoundsTile";
import type { System } from "./System";

export class BoundsSystem implements System {
    private readonly entityManager: EntityManager;
    private readonly tileMap: TileMap;

    constructor(entityManager: EntityManager, tileMap: TileMap) {
        this.entityManager = entityManager;
        this.tileMap = tileMap;

        this.entityManager.getAll().forEach((entity) => {
            this.drawBounds(entity);
        });
    }

    private drawBounds(entity: Entity): void {
        const bound = new UnitBoundsTile({
            q: 0,
            r: 0,
        });

        bound.loadMesh().then((root) => {
            const cr = this.tileMap.gridToWorldPosition(
                entity.gridPos.q,
                entity.gridPos.r
            );

            root.position.set(cr.x - TILE_SIZE / 2, 0.10, cr.z + TILE_SIZE / 2);
            entity.mesh.add(root);
            root.updateMatrixWorld();
            entity.mesh.updateMatrixWorld();
        });
    }

    update(dt: number): void {
        // throw new Error("Method not implemented.");
    }
}
