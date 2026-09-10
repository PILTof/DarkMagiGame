import * as THREE from "three";
import { now } from "three/examples/jsm/libs/tween.module.js";
import type { GridPos } from "../world/GridCoords";
import { Entity } from "./Entity";

export abstract class SpriteEntity extends Entity {
    protected finish: Function;
    protected readonly progress: Promise<any>;


    constructor(id: string, gridPos: GridPos, mesh: THREE.Group) {
        super(id, gridPos, mesh);
        this.finish = () => {};
        this.progress = new Promise((resolve) => {
            this.finish = resolve;
        });
    }

    public getProgress(): Promise<any>
    {
        return this.progress;
    }

    public abstract animate(dt: number): void;

    protected static createId(): string {
        return "sprite_" + now();
    }
}
