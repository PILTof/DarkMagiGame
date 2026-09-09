import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class AssetLoader {
  private readonly gltfLoader = new GLTFLoader();
  private readonly textureLoader = new THREE.TextureLoader();
  private readonly modelCache = new Map<string, THREE.Group>();
  private readonly textureCache = new Map<string, THREE.Texture>();

  async loadModel(url: string): Promise<THREE.Group> {
    const cached = this.modelCache.get(url);
    if (cached) {
      return cached.clone(true);
    }

    const gltf = await this.gltfLoader.loadAsync(url);
    const model = gltf.scene;
    this.modelCache.set(url, model);
    return model.clone(true);
  }

  cloneCached(url: string): THREE.Group | null {
    const cached = this.modelCache.get(url);
    return cached ? cached.clone(true) : null;
  }

  async loadTexture(url: string): Promise<THREE.Texture> {
    const cached = this.textureCache.get(url);
    if (cached) {
      return cached;
    }

    const texture = await this.textureLoader.loadAsync(url);
    this.textureCache.set(url, texture);
    return texture;
  }

  getTexture(url: string): THREE.Texture | null {
    return this.textureCache.get(url) ?? null;
  }
}
