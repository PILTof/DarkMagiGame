import { CanvasTexture, Sprite, SpriteMaterial, type Scene } from "three";
import type { Unit } from "../Unit";
import { Projectile, type ProjectileConfig } from "./Projectile";

export type DonutProjectileConfig = {
    liveTime: number;
};

export class DonutProjectile extends Projectile {
    private liveTime: number;
    private liveTimer: number;

    constructor(
        config: ProjectileConfig,
        additional: DonutProjectileConfig,
        onHit: (target: Unit, damage: number) => void,
    ) {
        config.sprite = DonutProjectile.createSprite();
        config.sprite.userData.name = "donut";
        super(config, onHit);
        this.liveTime = additional.liveTime;
        this.liveTimer = 0;
    }

    protected static createSprite(): Sprite {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ff6600";
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, Math.PI * 2);
        ctx.fill();

        const texture = new CanvasTexture(canvas);
        const material = new SpriteMaterial({
            map: texture,
            transparent: true,
        });
        return new Sprite(material);
    }

    update(dt: number, scene: Scene): boolean {
        const hit = this.updateProgress(dt);
        if (hit) {
            this.liveTimer = 0;
            return true;
        }
        
        this.liveTimer += dt;

        this.updateBasePosition();

        this.mesh.scale.multiplyScalar(0.001)

        return false;
    }

    protected updateProgress(dt: number): boolean {
        return dt >= this.liveTime;
    }

    protected updateBasePosition(): void {
        this.mesh.position.copy(this.target.position);
    }
}
