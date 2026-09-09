import * as THREE from "three";
import type { EventBus } from "../core/EventBus.ts";
import type {
    Projectile
} from "../entities/Projectiles/Projectile.ts";
import { TrailedProjectile } from "../entities/Projectiles/TrailedProjectile.ts";
import type { SpriteAssets } from "../entities/SpriteAssets.ts";
import type { System } from "./System.ts";
import { Effects } from "./contracts/EventNamesInterface.ts";
import type { ProjectileConfigs } from "./contracts/ProjectileConfigs.ts";

/**
 * Система управления снарядами
 */
export class ProjectileSystem implements System {
    private readonly scene: THREE.Scene;
    private readonly spriteAssets: SpriteAssets;
    private readonly eventBus: EventBus;
    private readonly projectiles: Map<string, Projectile> = new Map();

    constructor(
        scene: THREE.Scene,
        spriteAssets: SpriteAssets,
        eventBus: EventBus,
    ) {
        this.scene = scene;
        this.spriteAssets = spriteAssets;
        this.eventBus = eventBus;
    }

    /**
     * Обновляет все активные снаряды
     */
    update(dt: number): void {
        const toRemove: string[] = [];

        for (const [id, projectile] of this.projectiles.entries()) {
            const hasHit = projectile.update(dt, this.scene);

            if (hasHit) {
                // Снаряд достиг цели
                this.handleProjectileHit(projectile);
                toRemove.push(id);
            }
        }

        // Удаляем снаряды, достигшие цели
        for (const id of toRemove) {
            const projectile = this.projectiles.get(id);
            if (projectile) {
                projectile.dispose(this.scene);
                this.projectiles.delete(id);
            }
        }
    }

    /**
     * Выпускает снаряд
     */
    execute(config: ProjectileConfigs): string {
        // Создаем конкретный тип снаряда
        let projectile: Projectile = this.createProjectile(config);

        this.projectiles.set(projectile.id, projectile);
        this.scene.add(projectile.mesh);

        console.log(
            `[ProjectileSystem] Fired ${config.spriteType} from ${config.from.toArray()} to target ${config.target.id}`,
        );

        return projectile.id;
    }

    private createProjectile(config: ProjectileConfigs): Projectile {
        const sprite = this.createSpriteMesh(config.spriteType);

        switch (config.spriteType) {
            case "fireball":
                return new TrailedProjectile(
                    {
                        from: config.from,
                        target: config.target,
                        damage: config.damage,
                        speed: config.speed ?? 8,
                        sprite: sprite,
                    },
                    {
                        trailLength: 5,
                        trailInterval: 0.06,
                    },
                    (target) => config.onAfterFinish(target),
                );

            default:
                throw new Error(
                    "Unknown projectile type: [" + config.spriteType + "]",
                );
        }
    }

    /**
     * Создает спрайт снаряда
     */
    private createSpriteMesh(type: string): THREE.Sprite {
        // Пытаемся загрузить из SpriteAssets
        let sprite: THREE.Sprite | null = null;

        if (type === "fireball") {
            // Пробуем получить текстуру fireball
            const texture = this.spriteAssets.getTexture("fireball");
            if (texture) {
                const material = new THREE.SpriteMaterial({
                    map: texture,
                    transparent: true,
                    // blending: THREE.AdditiveBlending, // Свечение
                });
                sprite = new THREE.Sprite(material);
            }
        }

        // Fallback: создаем процедурный спрайт
        if (!sprite) {
            sprite = this.createFallbackSpriteMesh(type);
        }

        return sprite;
    }

    /**
     * Создает fallback спрайт если текстура не загружена
     */
    private createFallbackSpriteMesh(type: string): THREE.Sprite {
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
            blending: THREE.AdditiveBlending,
        });

        return new THREE.Sprite(material);
    }

    /**
     * Обрабатывает попадание снаряда
     */
    private handleProjectileHit(projectile: Projectile): void {
        // Вызываем коллбек попадания
        projectile.onHit(projectile.target, projectile.damage);

        // Emit событие для визуальных эффектов
        this.eventBus.emit(Effects.projectile_hit, {
            target: projectile.target,
            position: projectile.target.position,
            damage: projectile.damage,
            id: projectile.id
        });
    }

    /**
     * Получить количество активных снарядов
     */
    getActiveProjectilesCount(): number {
        return this.projectiles.size;
    }

    /**
     * Очищает все снаряды
     */
    clear(): void {
        for (const projectile of this.projectiles.values()) {
            projectile.dispose(this.scene);
        }
        this.projectiles.clear();
    }
}
