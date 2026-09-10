import type { Scene } from "three";
import { EventBus } from "../../core/EventBus";
import { Enemy } from "../../entities/Enemy";
import type { Entity } from "../../entities/Entity";
import { EntityManager } from "../../entities/EntityManager";
import { FireballProjectile } from "../../entities/projectiles/FireballProjectile";
import { ProjectileManager } from "../../entities/projectiles/ProjectileManager";
import { Unit } from "../../entities/Unit";
import { PlayerCombat } from "../contracts/EventNamesInterface";
import type { HitTarget } from "../DTOs/HitTarget";
import type { System } from "../System";
import { DistanceAttack } from "./CombatTypes/AOEAttack";

export class CombatSystem implements System {
    private readonly scene: Scene;
    private readonly projectileManager: ProjectileManager;

    constructor(scene: Scene) {
        this.scene = scene;
        this.projectileManager = ProjectileManager.getInstance(scene);
        this.setEvents();
    }

    private setEvents(): void {
        EventBus.getInstance().on(PlayerCombat.click_target, (e) =>
            this.onClickTarget(e.sniper, e.target),
        );

        EventBus.getInstance().on(PlayerCombat.cast_spell, (e) => {});

        EventBus.getInstance().on(PlayerCombat.dodge, (e) => {});
    }

    update(dt: number): void {
        EntityManager.getInstance()
            .getAll()
            .forEach((entity) => {
                this.checkHp(entity);
            });
    }

    private async onClickTarget(sniper: Unit, target: HitTarget): Promise<void> {
        const unit = target.entity;
        if (unit instanceof Enemy) {
            const modifiers = target.getBoundModifiers();
            const damage = modifiers?.health_points
                ? modifiers.health_points * 6
                : 6;

            if (!sniper.combatIsLocked('fireball'))  {
                this.projectileManager.runProjectile(
                    new FireballProjectile(sniper, unit)
                );
            }

            const payload = await new DistanceAttack("fireball").run({
                sniper: sniper,
                target: unit,
                damage: damage
            });
            payload?.target.takeDamage(damage);
        }
    }

    private checkHp(entity: Entity): void {
        if (entity instanceof Unit && entity.healthPoints <= 0) {
            EntityManager.getInstance().remove(entity.id, this.scene);
        }
    }
}
