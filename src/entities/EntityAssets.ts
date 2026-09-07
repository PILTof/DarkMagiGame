import * as THREE from "three";
import type { AssetLoader } from "../engine/AssetLoader.ts";

const ENTITY_MODEL_PATHS: Partial<Record<string, string>> = {
    player: "/assets/models/player.gltf",
    enemy: "/assets/models/entity.glb",
    // enemy: "/assets/models/enemy.gltf", // Можно добавить позже
};

export class EntityAssets {
    private readonly loader: AssetLoader;
    private readonly loaded = new Set<string>();

    private constructor(loader: AssetLoader) {
        this.loader = loader;
    }

    static async preload(loader: AssetLoader): Promise<EntityAssets> {
        const assets = new EntityAssets(loader);

        await Promise.all(
            (Object.entries(ENTITY_MODEL_PATHS) as [string, string][]).map(
                async ([type, url]) => {
                    try {
                        await loader.loadModel(url);
                        assets.loaded.add(type);
                    } catch (error) {
                        console.warn(
                            `[EntityAssets] Model "${type}" not loaded (${url}), using procedural fallback`,
                            error,
                        );
                    }
                },
            ),
        );

        return assets;
    }

    has(type: string): boolean {
        return this.loaded.has(type);
    }

    tryClone(type: string): THREE.Group | null {
        const url = ENTITY_MODEL_PATHS[type];
        if (!url || !this.loaded.has(type)) return null;
        return this.loader.cloneCached(url);
    }
}
