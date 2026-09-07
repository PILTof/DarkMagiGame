import type { Object3D } from "three";
import type { Entity } from "../entities/Entity";
import type { EntityManager } from "../entities/EntityManager";
import { GridCoords } from "../world/GridCoords";
import type { TileMap } from "../world/TileMap";
import { UnitBoundsTile } from "../world/tiles/UnitBoundsTile";
import type { System } from "./System";

export class BoundsSystem implements System {
    private readonly entityManager: EntityManager;
    private readonly tileMap: TileMap;
    private readonly boundYPos: number = 0.03;

    constructor(entityManager: EntityManager, tileMap: TileMap) {
        this.entityManager = entityManager;
        this.tileMap = tileMap;

        this.entityManager.getAll().forEach((entity) => {
            this.drawBounds(entity);
        });
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

            this.makeBound(lx, this.boundYPos, lz).then(mesh => entity.mesh.add(mesh));
        });

        this.makeBound(0, this.boundYPos, 0).then(mesh => entity.mesh.add(mesh));
    }

    private async makeBound(x: number, y: number, z: number): Promise<Object3D> {
        const bound = new UnitBoundsTile({ q: 0, r: 0 });
        const mesh = await bound.loadMesh();
        mesh.position.set(x, y, z);
        return mesh;

    }

    update(dt: number): void {
        // throw new Error("Method not implemented.");
    }
}
