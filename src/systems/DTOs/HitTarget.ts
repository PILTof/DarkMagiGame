import type { Object3D, Vector3Like } from "three";
import type { Entity } from "../../entities/Entity";
import { EntityManager } from "../../entities/EntityManager";
import { GridCoords, type GridPos } from "../../world/GridCoords";
import type { BoundModifiers } from "../BoundsSystem";

export class HitTarget {
    private readonly object: Object3D;
    private readonly entityManager: EntityManager;

    constructor(object: Object3D, entityManager: EntityManager) {
        this.object = object;
        this.entityManager = entityManager;
    }

    get entityId(): string {
        return this.object.userData.entityId;
    }

    get entity(): Entity | undefined {
        return this.entityManager.get(this.entityId);
    }

    get entityGridPos(): GridPos | undefined {
        return this.entity?.gridPos;
    }

    get position(): Vector3Like {
        return this.object.position;
    }

    getBoundModifiers(): BoundModifiers | undefined {
        return this.object.userData.modifiers;
    }

    get boundGrid(): GridPos | undefined {
        return this.object.userData.grid as GridPos | undefined;
    }

    getDistance(): number | undefined {
        return this.entityManager.getPlayer()?.position.distanceTo(this.object.position);
    }

    getGridDistance(from: GridPos): number {
        if (!this.entityGridPos) {
            throw new Error("Grid coordinated is undefined");
        }
        if (!this.entity) {
            throw new Error("Entity not found");
        }

        return GridCoords.distance(from, this.entity.gridPos);
    }
}
