import * as THREE from "three";
import type { Unit } from "../Unit.ts";
import { Projectile, type ProjectileConfig } from "./Projectile.ts";

export type TrailedProjectileConfig = {
    trailLength?: number;
    trailInterval?: number;
};

/**
 * Огненный шар с визуальным следом
 */
export class TrailedProjectile extends Projectile {
    private readonly trail: THREE.Sprite[] = [];
    private readonly trailLength: number;
    private readonly trailInterval: number;
    private trailTimer: number = 0;

    constructor(
        config: ProjectileConfig,
        additional: TrailedProjectileConfig,
        onHit: (target: Unit, damage: number) => void,
    ) {
        super(config, onHit);

        this.trailLength = additional.trailLength ?? 10;
        this.trailInterval = additional.trailInterval ?? 0.02;
    }

    /**
     * Обновляет базовую позицию (линейная интерполяция)
     */
    protected updateBasePosition(): void {
        this.mesh.position.lerpVectors(
            this.from,
            this.target.position,
            this.progress,
        );
    }

    /**
     * Обновляет прогресс движения
     */
    protected updateProgress(dt: number): boolean {
        const progressDelta = (this.speed / this.distance) * dt;
        this.progress += progressDelta;
        return this.progress >= 1.0;
    }

    /**
     * Обновляет позицию файрбола и его следа
     */
    update(dt: number, scene: THREE.Scene): boolean {
        // Обновляем прогресс
        const hasHit = this.updateProgress(dt);

        // Создаем след
        this.trailTimer += dt;
        if (this.trailTimer >= this.trailInterval) {
            this.createTrailParticle(scene);
            this.trailTimer = 0;
        }

        // Обновляем след (fade out)
        this.updateTrail(dt);

        if (hasHit) {
            // Достигли цели
            return true;
        }

        // Обновляем позицию (интерполяция от стартовой к текущей позиции цели)
        this.updateBasePosition();

        // Добавляем небольшую высоту (арка)
        const arcHeight = Math.sin(this.progress * Math.PI) * 0.5;
        this.mesh.position.y += arcHeight;

        return false;
    }

    /**
     * Создает частицу следа
     */
    private createTrailParticle(scene: THREE.Scene): void {
        if (this.trail.length >= this.trailLength) {
            // Удаляем самую старую частицу
            const oldest = this.trail.shift();
            if (oldest) {
                scene.remove(oldest);
                if (oldest.material.map) {
                    oldest.material.map.dispose();
                }
                oldest.material.dispose();
            }
        }

        // Клонируем материал и создаем новую частицу следа
        const trailSprite = this.mesh.clone();
        trailSprite.position.copy(this.mesh.position);
        trailSprite.scale.multiplyScalar(0.7); // Немного меньше

        // Сохраняем начальную непрозрачность
        trailSprite.userData.opacity = 1.0;
        trailSprite.userData.age = 0;

        scene.add(trailSprite);
        this.trail.push(trailSprite);
    }

    /**
     * Обновляет след (fade out эффект)
     */
    private updateTrail(dt: number): void {
        for (const particle of this.trail) {
            particle.userData.age += dt;
            const lifetime = 0.5; // Секунды до полного исчезновения
            particle.userData.opacity = Math.max(
                0,
                1 - particle.userData.age / lifetime,
            );
            particle.material.opacity = particle.userData.opacity;
        }
    }

    /**
     * Очищает ресурсы снаряда и его следа
     */
    override dispose(scene: THREE.Scene): void {
        // Очищаем след
        for (const particle of this.trail) {
            scene.remove(particle);
            if (particle.material.map) {
                particle.material.map.dispose();
            }
            particle.material.dispose();
        }
        this.trail.length = 0;

        // Вызываем базовый dispose
        super.dispose(scene);
    }
}
