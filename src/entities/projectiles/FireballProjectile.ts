import * as THREE from "three";
import { SpriteEntity } from "../SpriteEntity";
import type { Unit } from "../Unit";

export class FireballProjectile extends SpriteEntity {
    constructor(sniper: Unit, target: Unit) {

        super(
            SpriteEntity.createId(),
            sniper.gridPos,
            FireballProjectile.createMesh(),
        );

    }

    private static createMesh(): THREE.Group {

        

        return new THREE.Group();
    }

    public animate(dt: number): void {
        
    }

    public dispose(): void {
        throw new Error("Method not implemented.");
    }
}
