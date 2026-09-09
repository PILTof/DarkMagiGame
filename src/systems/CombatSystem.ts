import type { Scene } from "three";
import { EventBus } from "../core/EventBus";
import { Enemy } from "../entities/Enemy";
import type { Entity } from "../entities/Entity";
import { EntityManager } from "../entities/EntityManager";
import { Unit } from "../entities/Unit";
import { PlayerCombat } from "./contracts/EventNamesInterface";
import type { HitTarget } from "./DTOs/HitTarget";
import type { System } from "./System";

export class CombatSystem implements System {
    private readonly scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.setEvents();
    }

    private setEvents(): void {
        EventBus.getInstance().on(PlayerCombat.hit_targer, (e) =>
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

    private onHitTarget(sniper: Entity, target: HitTarget): void {
        console.log("hitted", [sniper.id, target.entityId]);
        
        const unit = target.entity;
        if (unit instanceof Enemy) {
            const modifiers = target.getBoundModifiers()
            unit.takeDamage(modifiers?.health_points ? modifiers.health_points * 6 : 6);
        }

    }

    private checkHp(entity: Entity): void {
        if (entity instanceof Unit && entity.healthPoints <= 0) {
            EntityManager.getInstance().remove(entity.id, this.scene);
        }
    }
}
