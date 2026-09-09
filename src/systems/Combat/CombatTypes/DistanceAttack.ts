import type { Vector3 } from "three";
import { EventBus } from "../../../core/EventBus";
import type { Unit } from "../../../entities/Unit";
import { Effects } from "../../contracts/EventNamesInterface";
import type { ProjectileSystem } from "../../ProjectileSystem";
import { Attack } from "../Attack";

export type DistanceAttackConfig = {
    sniper: Unit;
    target: Unit;
    damage: number;
    spriteType: string;
};

export class DistanceAttack extends Attack {
    private readonly projectileSystem: ProjectileSystem;

    constructor(projectileSystem: ProjectileSystem) {
        super();
        this.projectileSystem = projectileSystem;

        EventBus.getInstance().on(Effects.projectile_hit, (payload) => {
            this.resolve(payload);
        });
    }

    public async run(config: DistanceAttackConfig): Promise<{
        target: Unit;
        position: Vector3;
        damage: number;
        id: string;
    }> {
        if (!config.sniper.canAttack) {
            return new Promise(() => {});
        }

        config.sniper.canAttack = false;

        setTimeout(() => {
            config.sniper.canAttack = true;
        }, 0.7 * 1000);

        switch (config.spriteType) {
            case "fireball":
                this.projectileSystem.execute({
                    from: config.sniper.position.clone(),
                    target: config.target,
                    damage: config.damage,
                    speed: 5,
                    spriteType: "fireball",
                    onAfterFinish: (unit) => {
                        // make some another sprite effect
                    },
                });
                break;

            default:
                throw new Error("Не указан sprite type");
        }

        return this.promise;
    }
}
