import type { Vector3 } from "three";
import type { Unit } from "../../../entities/Unit";
import { Attack } from "../Attack";

export type AOEAttackConfig = {
    sniper: Unit;
    target: Unit;
    damage: number;
    spriteType: string;
};

export class AOEAttack extends Attack {
    constructor(combatId: string ) {
        super(combatId);
    }

    public async run(config: AOEAttackConfig): Promise<{
        target: Unit;
        position: Vector3;
        damage: number;
        id: string;
    } | null> {

        if (config.sniper.combatIsLocked(this.combatId)) {
            return null;
        }

        config.sniper.lockCombat(this.combatId);

        setTimeout(() => {
            config.sniper.unlockCombat(this.combatId);
            this.resolve({
                target: config.target,
                position: config.sniper.position,
                damage: config.damage,
                id: this.combatId
            })
        }, 1000);

        return this.promise;
    }
}
