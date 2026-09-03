import * as THREE from "three";
import type { GridPos } from "../../GridCoords.ts";
import type { MapObjectType } from "../MapData.ts";
import type { MapObjectAssets } from "./MapObjectAssets.ts";

export abstract class MapObjectBase {
  readonly pos: GridPos;
  private root: THREE.Object3D | null = null;
  private loadPromise: Promise<THREE.Object3D> | null = null;

  constructor(pos: GridPos) {
    this.pos = pos;
  }

  abstract readonly type: MapObjectType;

  /**
   * Occupied hexes relative to the object's anchor (`pos`).
   * Example: `[{ q: 0, r: 0 }]` — only the anchor cell.
   */
  abstract readonly footprint: ReadonlyArray<GridPos>;

  get blocking(): boolean {
    return this.footprint.length > 0;
  }

  /** Absolute grid cells blocked by this object. */
  getBlockingCells(): GridPos[] {
    return this.footprint.map(({ q, r }) => ({
      q: this.pos.q + q,
      r: this.pos.r + r,
    }));
  }

  loadMesh(assets: MapObjectAssets): Promise<THREE.Object3D> {
    if (this.root) return Promise.resolve(this.root);

    this.loadPromise ??= this.createMesh(assets).then((root) => {
      this.applyMeshDefaults(root);
      this.root = root;
      return root;
    });

    return this.loadPromise;
  }

  get object3D(): THREE.Object3D {
    if (!this.root) {
      throw new Error(
        `Map object (${this.pos.q}, ${this.pos.r}) is not loaded. Call loadMesh() first.`,
      );
    }
    return this.root;
  }

  protected abstract createMesh(
    assets: MapObjectAssets,
  ): Promise<THREE.Object3D>;

  protected applyMeshDefaults(root: THREE.Object3D): void {
    root.userData = {
      q: this.pos.q,
      r: this.pos.r,
      type: "map-object",
      objectType: this.type,
    };
  }

  /**
   * Scale model to target height, center on XZ, and sit on y = 0.
   * Returns a wrapper group so TileMap can set world position without
   * overwriting the grounding offset.
   */
  protected wrapFittedModel(
    model: THREE.Object3D,
    targetHeight: number,
  ): THREE.Group {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);

    if (size.y > 0) {
      model.scale.multiplyScalar(targetHeight / size.y);
    }

    const fitted = new THREE.Box3().setFromObject(model);
    model.position.set(
      -(fitted.min.x + fitted.max.x) / 2,
      -fitted.min.y,
      -(fitted.min.z + fitted.max.z) / 2,
    );

    const group = new THREE.Group();
    group.add(model);
    return group;
  }
}
