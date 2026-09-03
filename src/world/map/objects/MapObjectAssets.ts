import * as THREE from "three";
import type { AssetLoader } from "../../../engine/AssetLoader.ts";
import type { MapObjectType } from "../MapData.ts";

const OBJECT_MODEL_PATHS: Partial<Record<MapObjectType, string>> = {
  tree: "/assets/models/tree.gltf",
};

export class MapObjectAssets {
  private readonly loader: AssetLoader;
  private readonly loaded = new Set<MapObjectType>();

  private constructor(loader: AssetLoader) {
    this.loader = loader;
  }

  static async preload(loader: AssetLoader): Promise<MapObjectAssets> {
    const assets = new MapObjectAssets(loader);

    await Promise.all(
      (Object.entries(OBJECT_MODEL_PATHS) as [MapObjectType, string][]).map(
        async ([type, url]) => {
          try {
            await loader.loadModel(url);
            assets.loaded.add(type);
          } catch (error) {
            console.warn(
              `[MapObjectAssets] Model "${type}" not loaded (${url}), using procedural fallback`,
              error,
            );
          }
        },
      ),
    );

    return assets;
  }

  has(type: MapObjectType): boolean {
    return this.loaded.has(type);
  }

  tryClone(type: MapObjectType): THREE.Group | null {
    const url = OBJECT_MODEL_PATHS[type];
    if (!url || !this.loaded.has(type)) return null;
    return this.loader.cloneCached(url);
  }
}
