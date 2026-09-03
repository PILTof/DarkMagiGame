import * as THREE from "three";
import type { AssetLoader } from "../../engine/AssetLoader.ts";

const TILE_MODEL_PATHS: Record<string, string> = {
  // grass: "/assets/models/tiles/grass.glb",
  // stone: "/assets/models/tiles/stone.glb",
  water: "/assets/models/water.gltf",
  grass: "/assets/models/hex_grass.gltf",
  grass2: "/assets/models/hex_grass_2.gltf",
  grass3: "/assets/models/hex_grass_3.gltf",
  grass_empty: "/assets/models/hex_grass_empty.gltf",

};

export class TileAssets {
  private readonly loader: AssetLoader;
  private readonly loaded = new Set<string>();

  private constructor(loader: AssetLoader) {
    this.loader = loader;
  }

  static async preload(loader: AssetLoader): Promise<TileAssets> {
    const assets = new TileAssets(loader);

    await Promise.all(
      (Object.entries(TILE_MODEL_PATHS) as [string, string][]).map(
        async ([type, url]) => {
          try {
            await loader.loadModel(url);
            assets.loaded.add(type);
          } catch (error) {
            console.warn(
              `[TileAssets] Model "${type}" not loaded (${url}), using procedural fallback`,
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
    if (!this.loaded.has(type)) return null;
    return this.loader.cloneCached(TILE_MODEL_PATHS[type]);
  }
}
