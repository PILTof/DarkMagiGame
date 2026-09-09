import * as THREE from "three";
import type { Unit } from "./Unit.ts";

export interface ProjectileConfig {
    from: THREE.Vector3;
    target: Unit;
    damage: number;
    speed?: number;
    sprite?: THREE.Sprite;
    trailLength?: number;
    trailInterval?: number;
}

/**
 * Снаряд, летящий к цели
 */
export class Projectile {
    readonly id: string;
    readonly mesh: THREE.Sprite;
    readonly from: THREE.Vector3;
    readonly target: Unit;
    readonly speed: number;
    readonly damage: number;
    readonly onHit: (target: Unit, damage: number) => void;
    
    private progress: number = 0;
    private distance: number;
    private readonly trail: THREE.Sprite[] = [];
    private readonly trailLength: number;
    private readonly trailInterval: number;
    private trailTimer: number = 0;

    constructor(
        config: ProjectileConfig,
        onHit: (target: Unit, damage: number) => void
    ) {
        this.id = `projectile_${Date.now()}_${Math.random()}`;
        this.from = config.from.clone();
        this.target = config.target;
        this.damage = config.damage;
        this.speed = config.speed ?? 8;
        this.onHit = onHit;
        this.trailLength = config.trailLength ?? 10;
        this.trailInterval = config.trailInterval ?? 0.02; // Создавать след каждые 0.02 секунды

        // Используем переданный спрайт или создаем заглушку
        if (config.sprite) {
            this.mesh = config.sprite;
        } else {
            // Fallback: простой оранжевый круг
            const canvas = document.createElement("canvas");
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext("2d")!;
            ctx.fillStyle = "#ff6600";
            ctx.beginPath();
            ctx.arc(16, 16, 12, 0, Math.PI * 2);
            ctx.fill();
            
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
            });
            this.mesh = new THREE.Sprite(material);
        }

        this.mesh.scale.set(0.3, 0.3, 1);
        this.mesh.position.copy(this.from);

        // Вычисляем дистанцию до цели
        this.distance = this.from.distanceTo(this.target.position);
    }

    /**
     * Обновляет позицию снаряда
     * @returns true если достиг цели
     */
    update(dt: number, scene: THREE.Scene): boolean {
        // Обновляем прогресс
        const progressDelta = (this.speed / this.distance) * dt;
        this.progress += progressDelta;

        // Создаем след
        this.trailTimer += dt;
        if (this.trailTimer >= this.trailInterval) {
            this.createTrailParticle(scene);
            this.trailTimer = 0;
        }

        // Обновляем след (fade out)
        this.updateTrail(dt);

        if (this.progress >= 1.0) {
            // Достигли цели
            return true;
        }

        // Обновляем позицию (интерполяция от стартовой к текущей позиции цели)
        this.mesh.position.lerpVectors(
            this.from,
            this.target.position,
            this.progress
        );

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
     * Очищает ресурсы снаряда
     */
    dispose(scene: THREE.Scene): void {
        scene.remove(this.mesh);
        
        // Очищаем след
        for (const particle of this.trail) {
            scene.remove(particle);
            if (particle.material.map) {
                particle.material.map.dispose();
            }
            particle.material.dispose();
        }
        this.trail.length = 0;

        // Очищаем основной mesh
        if (this.mesh.material.map) {
            this.mesh.material.map.dispose();
        }
        this.mesh.material.dispose();
    }
}
