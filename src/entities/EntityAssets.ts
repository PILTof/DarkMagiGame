import * as THREE from "three";
import type { AssetLoader } from "../engine/AssetLoader.ts";

export type EntityType = "player" | "enemy";

const ENTITY_MODEL_PATHS: Partial<Record<EntityType, string>> = {
  player: "/assets/models/player.glb",
  // enemy: "/assets/models/enemy.gltf", // Можно добавить позже
};

export class EntityAssets {
  private readonly loader: AssetLoader;
  private readonly loaded = new Set<EntityType>();

  private constructor(loader: AssetLoader) {
    this.loader = loader;
  }

  static async preload(loader: AssetLoader): Promise<EntityAssets> {
    const assets = new EntityAssets(loader);

    await Promise.all(
      (Object.entries(ENTITY_MODEL_PATHS) as [EntityType, string][]).map(
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

  has(type: EntityType): boolean {
    return this.loaded.has(type);
  }

  tryClone(type: EntityType): THREE.Group | null {
    const url = ENTITY_MODEL_PATHS[type];
    if (!url || !this.loaded.has(type)) return null;
    return this.loader.cloneCached(url);
  }
}
