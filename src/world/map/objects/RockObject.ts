import * as THREE from "three";
import type { GridPos } from "../../GridCoords.ts";
import type { MapObjectAssets } from "./MapObjectAssets.ts";
import { MapObjectBase } from "./MapObjectBase.ts";

export class RockObject extends MapObjectBase {
  readonly type = "rock" as const;
  readonly footprint: ReadonlyArray<GridPos> = [{ q: 0, r: 0 }];

  protected async createMesh(
    _assets: MapObjectAssets,
  ): Promise<THREE.Object3D> {
    return this.buildProceduralMesh();
  }

  private buildProceduralMesh(): THREE.Group {
    const group = new THREE.Group();

    const rock = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.2, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.9 }),
    );
    rock.position.y = 0.1;
    group.add(rock);

    return group;
  }
}
