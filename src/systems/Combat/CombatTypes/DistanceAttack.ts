import type { Vector3 } from "three";
import { EventBus } from "../../../core/EventBus";
import type { Unit } from "../../../entities/Unit";
import { Effects } from "../../contracts/EventNamesInterface";
import { Attack } from "../Attack";

export type DistanceAttackConfig = {
    sniper: Unit;
    target: Unit;
    damage: number;
    spriteType: string;
};

export class DistanceAttack extends Attack {

    constructor(combatId: string) {
        super(combatId);

        EventBus.getInstance().on(Effects.projectile_hit, (payload) => {
            this.resolve(payload);
        });
    }

    public async run(config: DistanceAttackConfig): Promise<{
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
            EventBus.getInstance().emit(Effects.projectile_hit);
        }, 0.7 * 1000);

        return this.promise;
    }
}
