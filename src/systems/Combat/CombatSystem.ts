import { calculateArmorReducedDamage } from "../../combat/DamageCalculator.ts";
import type { EventBus } from "../../core/EventBus.ts";
import { Enemy } from "../../entities/Enemy.ts";
import { FireballProjectile } from "../../entities/projectiles/FireballProjectile.ts";
import type { ProjectileManager } from "../../entities/projectiles/ProjectileManager.ts";
import { Unit } from "../../entities/Unit.ts";
import { PlayerCombat } from "../contracts/EventNamesInterface.ts";
import type { HitTarget } from "../DTOs/HitTarget.ts";
import type { System } from "../System.ts";
import { DistanceAttack } from "./CombatTypes/DistanceAttack.ts";

export class CombatSystem implements System {
    private readonly eventBus: EventBus;
    private readonly projectileManager: ProjectileManager;

    constructor(eventBus: EventBus, projectileManager: ProjectileManager) {
        this.eventBus = eventBus;
        this.projectileManager = projectileManager;
        this.setEvents();
    }

    private setEvents(): void {
        this.eventBus.on(PlayerCombat.click_target, ({ sniper, target }) =>
            this.onClickTarget(sniper, target),
        );
        this.eventBus.on(PlayerCombat.cast_spell, () => {});
        this.eventBus.on(PlayerCombat.dodge, () => {});
    }

    update(_dt: number): void {}

    private async onClickTarget(sniper: Unit, target: HitTarget): Promise<void> {
        const unit = target.entity;
        if (!(unit instanceof Enemy)) return;

        const damage = calculateArmorReducedDamage(20, target.getBoundModifiers()?.armor);
        if (!sniper.combatIsLocked("fireball")) {
            this.projectileManager.runProjectile(new FireballProjectile(sniper, unit));
        }
        const payload = await new DistanceAttack("fireball").run({ sniper, target: unit, damage });
        payload?.target.takeDamage(payload.damage);
    }
}
