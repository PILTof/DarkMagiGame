import type { Object3D, Vector3Like } from "three";
import type { Entity } from "../../entities/Entity";
import { EntityManager } from "../../entities/EntityManager";
import { GridCoords, type GridPos } from "../../world/GridCoords";
import type { BoundModifiers } from "../BoundsSystem";

export class HitTarget {
    private readonly object: Object3D;

    constructor(object: Object3D) {
        this.object = object;
    }

    get entityId(): string {
        return this.object.userData.entityId;
    }

    get entity(): Entity | undefined {
        return EntityManager.getInstance().get(this.entityId);
    }

    get gridPos(): GridPos | undefined {
        return this.entity?.gridPos;
    }

    get position(): Vector3Like {
        return this.object.position;
    }

    getBoundModifiers(): BoundModifiers | undefined {
        return this.object.userData.modifiers;
    }

    getDistance(): number | undefined {
        return EntityManager.getInstance()
            .getPlayer()
            ?.position.distanceTo(this.object.position);
    }

    getGridDistance(from: GridPos): number {
        if (!this.gridPos) {
            throw new Error("Grid coordinated is undefined");
        }
        if (!this.entity) {
            throw new Error("Entity not found");
        }

        return GridCoords.distance(from, this.entity.gridPos);
    }
}
