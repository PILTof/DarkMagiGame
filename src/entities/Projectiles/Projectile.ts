import * as THREE from "three";
import { SpriteEntity } from "../SpriteEntity.ts";
import type { Unit } from "../Unit.ts";

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
 * Базовый класс для всех снарядов
 */
export abstract class Projectile extends SpriteEntity {
    readonly from: THREE.Vector3;
    readonly target: Unit;
    readonly speed: number;
    readonly damage: number;
    readonly onHit: (target: Unit, damage: number) => void;
    
    protected progress: number = 0;
    protected distance: number;

    constructor(
        config: ProjectileConfig,
        onHit: (target: Unit, damage: number) => void
    ) {
        const sprite = config.sprite ?? Projectile.createFallbackSprite();
        super(sprite, config.from);
        
        this.from = config.from.clone();
        this.target = config.target;
        this.damage = config.damage;
        this.speed = config.speed ?? 8;
        this.onHit = onHit;

        this.mesh.scale.set(0.3, 0.3, 1);
        this.mesh.position.copy(this.from);

        // Вычисляем дистанцию до цели
        this.distance = this.from.distanceTo(this.target.position);
    }

    /**
     * Создает fallback спрайт
     */
    protected static createFallbackSprite(): THREE.Sprite {
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
        return new THREE.Sprite(material);
    }

    /**
     * Обновляет позицию снаряда
     * @returns true если достиг цели
     */
    abstract update(dt: number, scene: THREE.Scene): boolean;

    /**
     * Обновляет прогресс движения
     */
    protected updateProgress(dt: number): boolean {
        const progressDelta = (this.speed / this.distance) * dt;
        this.progress += progressDelta;
        return this.progress >= 1.0;
    }

    /**
     * Обновляет базовую позицию (линейная интерполяция)
     */
    protected updateBasePosition(): void {
        this.mesh.position.lerpVectors(
            this.from,
            this.target.position,
            this.progress
        );
    }
}
