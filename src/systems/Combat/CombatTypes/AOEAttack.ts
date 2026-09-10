import type { Vector3 } from "three";
import { EventBus } from "../../../core/EventBus";
import type { Unit } from "../../../entities/Unit";
import { Effects } from "../../contracts/EventNamesInterface";
import type { ProjectileSystem } from "../../ProjectileSystem";
import { Attack } from "../Attack";

export type AOEAttackConfig = {
    sniper: Unit;
    target: Unit;
    damage: number;
    spriteType: string;
};

export class AOEAttack extends Attack {
    protected combatId: string = "";
    private readonly projectileSystem: ProjectileSystem;

    constructor(combatId: string, projectileSystem: ProjectileSystem) {
        super(combatId);
        this.projectileSystem = projectileSystem;

        EventBus.getInstance().on(Effects.projectile_hit, (payload) => {
            this.resolve(payload);
        });
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
        }, 1 * 1000);

        this.projectileSystem.execute({
            from: config.sniper.position.clone(),
            target: config.target,
            damage: config.damage,
            speed: 5,
            spriteType: "donut",
            onAfterFinish: (unit) => {
                // make some another sprite effect
            },
        });

        return this.promise;
    }
}
