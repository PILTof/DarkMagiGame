import type { Scene } from "three";
import { calculateArmorReducedDamage } from "../../combat/DamageCalculator";
import { EventBus } from "../../core/EventBus";
import { Enemy } from "../../entities/Enemy";

import { FireballProjectile } from "../../entities/projectiles/FireballProjectile";
import { ProjectileManager } from "../../entities/projectiles/ProjectileManager";
import { Unit } from "../../entities/Unit";
import { PlayerCombat } from "../contracts/EventNamesInterface";
import type { HitTarget } from "../DTOs/HitTarget";
import type { System } from "../System";
import { DistanceAttack } from "./CombatTypes/DistanceAttack";

export class CombatSystem implements System {
    private readonly projectileManager: ProjectileManager;

    constructor(scene: Scene) {
        this.projectileManager = ProjectileManager.getInstance(scene);
        this.setEvents();
    }

    private setEvents(): void {
        EventBus.getInstance().on(PlayerCombat.click_target, (e) =>
            this.onClickTarget(e.sniper, e.target),
        );

        EventBus.getInstance().on(PlayerCombat.cast_spell, (_e) => {});

        EventBus.getInstance().on(PlayerCombat.dodge, (_e) => {});
    }

    update(_dt: number): void {}

    private async onClickTarget(
        sniper: Unit,
        target: HitTarget,
    ): Promise<void> {
        const unit = target.entity;
        if (unit instanceof Enemy) {
            const damage = calculateArmorReducedDamage(
                20,
                target.getBoundModifiers()?.armor,
            );

            if (!sniper.combatIsLocked("fireball")) {
                this.projectileManager.runProjectile(
                    new FireballProjectile(sniper, unit),
                );
            }
            
            const payload = await new DistanceAttack("fireball").run({
                sniper: sniper,
                target: unit,
                damage: damage
            });
            payload?.target.takeDamage(payload.damage);
        }
    }

}
