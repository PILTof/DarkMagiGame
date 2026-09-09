import * as THREE from "three";
import type { Unit } from "../Unit.ts";
import { Projectile, type ProjectileConfig } from "./Projectile.ts";

/**
 * Огненный шар с визуальным следом
 */
export class FireballProjectile extends Projectile {
    private readonly trail: THREE.Sprite[] = [];
    private readonly trailLength: number;
    private readonly trailInterval: number;
    private trailTimer: number = 0;

    constructor(
        config: ProjectileConfig,
        onHit: (target: Unit, damage: number) => void
    ) {
        super(config, onHit);
        
        this.trailLength = config.trailLength ?? 10;
        this.trailInterval = config.trailInterval ?? 0.02;
    }

    /**
     * Создает fallback спрайт для файрбола
     */
    protected static override createFallbackSprite(): THREE.Sprite {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d")!;

        // Рисуем огненный шар
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, "#ffff00"); // Желтый центр
        gradient.addColorStop(0.5, "#ff6600"); // Оранжевый
        gradient.addColorStop(1, "rgba(255, 0, 0, 0)"); // Прозрачный красный

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending, // Свечение
        });

        return new THREE.Sprite(material);
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
            particle.userData.opacity = Math.max(0, 1 - particle.userData.age / lifetime);
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
