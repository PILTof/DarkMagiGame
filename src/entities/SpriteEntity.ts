import * as THREE from "three";
import { now } from "three/examples/jsm/libs/tween.module.js";
import type { GridPos } from "../world/GridCoords";
import { Entity } from "./Entity";

export abstract class SpriteEntity extends Entity {
    constructor(id: string, gridPos: GridPos, mesh: THREE.Group) {
        super(id, gridPos, mesh);
    }

    public abstract animate(dt: number): void;

    public abstract dispose(): void;

    protected static createId(): string
    {
        return "sprite_" + now();
    }
}
