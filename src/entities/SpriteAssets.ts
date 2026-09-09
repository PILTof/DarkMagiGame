import * as THREE from "three";
import type { AssetLoader } from "../engine/AssetLoader.ts";

/**
 * Типы спрайтов в игре
 */
export type SpriteType = 
    | "damage_number"
    | "heal_number"
    | "critical_hit"
    | "miss"
    | "hit_effect"
    | "skill_icon"
    | "buff_icon"
    | "debuff_icon";

/**
 * Пути к спрайтам
 */
const SPRITE_PATHS: Partial<Record<SpriteType, string>> = {
    damage_number: "/assets/sprites/damage.png",
    heal_number: "/assets/sprites/heal.png",
    critical_hit: "/assets/sprites/critical.png",
    miss: "/assets/sprites/miss.png",
    hit_effect: "/assets/sprites/hit_effect.png",
    skill_icon: "/assets/sprites/skill.png",
    buff_icon: "/assets/sprites/buff.png",
    debuff_icon: "/assets/sprites/debuff.png",
};

/**
 * Настройки для спрайта
 */
export interface SpriteConfig {
    minFilter?: THREE.MinificationTextureFilter;
    magFilter?: THREE.MagnificationTextureFilter;
    wrapS?: THREE.Wrapping;
    wrapT?: THREE.Wrapping;
    transparent?: boolean;
}

/**
 * Управляет загрузкой и кешированием спрайтов/текстур
 */
export class SpriteAssets {
    private readonly loader: AssetLoader;
    private readonly loaded = new Set<SpriteType>();

    private constructor(loader: AssetLoader) {
        this.loader = loader;
    }

    /**
     * Предзагружает спрайты
     */
    static async preload(loader: AssetLoader): Promise<SpriteAssets> {
        const assets = new SpriteAssets(loader);

        await Promise.all(
            (Object.entries(SPRITE_PATHS) as [SpriteType, string][]).map(
                async ([type, url]) => {
                    try {
                        await loader.loadTexture(url);
                        assets.loaded.add(type);
                        console.log(`[SpriteAssets] Loaded sprite: ${type}`);
                    } catch (error) {
                        console.warn(
                            `[SpriteAssets] Sprite "${type}" not loaded (${url})`,
                            error,
                        );
                    }
                },
            ),
        );

        return assets;
    }

    /**
     * Проверяет, загружен ли спрайт
     */
    has(type: SpriteType): boolean {
        return this.loaded.has(type);
    }

    /**
     * Получает текстуру спрайта
     */
    getTexture(type: SpriteType): THREE.Texture | null {
        const url = SPRITE_PATHS[type];
        if (!url || !this.loaded.has(type)) return null;
        return this.loader.getTexture(url);
    }

    /**
     * Создает спрайт с текстурой
     */
    createSprite(
        type: SpriteType,
        config?: SpriteConfig,
    ): THREE.Sprite | null {
        const texture = this.getTexture(type);
        if (!texture) return null;

        // Применяем настройки к текстуре
        if (config) {
            if (config.minFilter !== undefined)
                texture.minFilter = config.minFilter;
            if (config.magFilter !== undefined)
                texture.magFilter = config.magFilter;
            if (config.wrapS !== undefined) texture.wrapS = config.wrapS;
            if (config.wrapT !== undefined) texture.wrapT = config.wrapT;
        }

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: config?.transparent ?? true,
        });

        return new THREE.Sprite(material);
    }

    /**
     * Создает материал с текстурой спрайта
     */
    createMaterial(
        type: SpriteType,
        config?: SpriteConfig & { materialType?: "basic" | "standard" | "sprite" },
    ): THREE.Material | null {
        const texture = this.getTexture(type);
        if (!texture) return null;

        // Применяем настройки к текстуре
        if (config) {
            if (config.minFilter !== undefined)
                texture.minFilter = config.minFilter;
            if (config.magFilter !== undefined)
                texture.magFilter = config.magFilter;
            if (config.wrapS !== undefined) texture.wrapS = config.wrapS;
            if (config.wrapT !== undefined) texture.wrapT = config.wrapT;
        }

        const materialType = config?.materialType ?? "sprite";
        const transparent = config?.transparent ?? true;

        switch (materialType) {
            case "basic":
                return new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent,
                });
            case "standard":
                return new THREE.MeshStandardMaterial({
                    map: texture,
                    transparent,
                });
            case "sprite":
            default:
                return new THREE.SpriteMaterial({
                    map: texture,
                    transparent,
                });
        }
    }

    /**
     * Получает список всех загруженных спрайтов
     */
    getLoadedSprites(): SpriteType[] {
        return Array.from(this.loaded);
    }
}
