import type { Vector3 } from "three";
import type { Unit } from "../../entities/Unit";

export interface FireProjectileConfig {
    from: Vector3;
    target: Unit;
    damage: number;
    speed?: number;
    spriteType: string;
    onAfterFinish: (unit: Unit) => void;
    trailLength?: number;
    trailInterval?: number;
}

export type ProjectileConfigs = FireProjectileConfig;
