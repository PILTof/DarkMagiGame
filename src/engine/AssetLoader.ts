import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class AssetLoader {
  private readonly loader = new GLTFLoader();
  private readonly cache = new Map<string, THREE.Group>();

  async loadModel(url: string): Promise<THREE.Group> {
    const cached = this.cache.get(url);
    if (cached) {
      return cached.clone(true);
    }

    const gltf = await this.loader.loadAsync(url);
    const model = gltf.scene;
    this.cache.set(url, model);
    return model.clone(true);
  }

  cloneCached(url: string): THREE.Group | null {
    const cached = this.cache.get(url);
    return cached ? cached.clone(true) : null;
  }
}
