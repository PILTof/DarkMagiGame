import * as THREE from "three";
import { getRandFromArray } from "../../../mathutils/GetRandFromArray.ts";
import type { GridPos } from "../../GridCoords.ts";
import type { MapObjectAssets } from "./MapObjectAssets.ts";
import { MapObjectBase } from "./MapObjectBase.ts";

export class TreeObject extends MapObjectBase {
  private static readonly TARGET_HEIGHT = 5.5;

  readonly type = "tree" as const;
  readonly footprint: ReadonlyArray<GridPos> = [
    { q: 0, r: 0 }
  ];

  protected async createMesh(
    assets: MapObjectAssets,
  ): Promise<THREE.Object3D> {
    const model = assets.tryClone("tree");
    if (model) {
      const wrapped = this.wrapFittedModel(model, TreeObject.TARGET_HEIGHT);
      wrapped.rotation.y = THREE.MathUtils.degToRad(getRandFromArray([90, 90 * 2, 90 * 3, 90 * 4]))
      return wrapped;
    }

    return this.buildProceduralMesh();
  }

  private buildProceduralMesh(): THREE.Group {
    const group = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.35, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x5c3d1e }),
    );
    trunk.position.y = 0.175;
    group.add(trunk);

    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.45, 6),
      new THREE.MeshStandardMaterial({ color: 0x2f6b3a }),
    );
    crown.position.y = 0.55;
    group.add(crown);

    return group;
  }
}
