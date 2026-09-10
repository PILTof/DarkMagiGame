import type { Scene } from "three";
import { EventBus } from "../../core/EventBus";
import { Enemy } from "../../entities/Enemy";
import type { Entity } from "../../entities/Entity";
import { EntityManager } from "../../entities/EntityManager";
import { Unit } from "../../entities/Unit";
import { PlayerCombat } from "../contracts/EventNamesInterface";
import type { HitTarget } from "../DTOs/HitTarget";
import type { ProjectileSystem } from "../ProjectileSystem";
import type { System } from "../System";
import { AOEAttack } from "./CombatTypes/AOEAttack";

export class CombatSystem implements System {
    private readonly scene: Scene;
    private readonly projectileSystem: ProjectileSystem;

    constructor(scene: Scene, projectileSystem: ProjectileSystem) {
        this.scene = scene;
        this.projectileSystem = projectileSystem;
        this.setEvents();
    }

    private setEvents(): void {
        EventBus.getInstance().on(PlayerCombat.hit_target, (e) =>
            this.onHitTarget(e.sniper, e.target),
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

    private async onHitTarget(sniper: Unit, target: HitTarget): Promise<void> {
        const unit = target.entity;
        if (unit instanceof Enemy) {
            const modifiers = target.getBoundModifiers();
            const damage = modifiers?.health_points
                ? modifiers.health_points * 6
                : 6;

            // const payload = await new DistanceAttack('fireball', this.projectileSystem).run(
            //     {
            //         sniper: sniper,
            //         target: unit,
            //         damage: damage,
            //         spriteType: "fireball",
            //     },
            // );
            const payload = await new AOEAttack('donut', this.projectileSystem).run(
                {
                    sniper: sniper,
                    target: unit,
                    damage: damage,
                    spriteType: 'donut'
                }
            )

            payload?.target.takeDamage(damage);
        }
    }

    private checkHp(entity: Entity): void {
        if (entity instanceof Unit && entity.healthPoints <= 0) {
            EntityManager.getInstance().remove(entity.id, this.scene);
        }
    }
}
