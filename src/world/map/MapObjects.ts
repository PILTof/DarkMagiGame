import * as THREE from "three";
import { TILE_SIZE } from "../../config/gameConfig.ts";
import { GridCoords, type GridPos } from "../GridCoords.ts";
import type { MapObjectType } from "./MapData.ts";

export class MapObjects {
  private readonly blockingTypes = new Set<MapObjectType>(["tree", "rock"]);
  private readonly footprintBoxes = new Map<MapObjectType, THREE.Box3>();

  isBlocking(type: MapObjectType): boolean {
    return this.blockingTypes.has(type);
  }

  /** Гексы, перекрываемые объектом по его визуальному bounding box. */
  getBlockingCells(type: MapObjectType, anchorQ: number, anchorR: number): GridPos[] {
    const localBox = this.getFootprintBox(type);
    const center = GridCoords.gridToWorld(anchorQ, anchorR);

    const minX = center.x + localBox.min.x;
    const maxX = center.x + localBox.max.x;
    const minZ = center.z + localBox.min.z;
    const maxZ = center.z + localBox.max.z;

    const searchRange =
      Math.ceil(Math.max(maxX - minX, maxZ - minZ) / (TILE_SIZE * 1.5)) + 1;

    const cells: GridPos[] = [];
    const seen = new Set<string>();

    for (let dq = -searchRange; dq <= searchRange; dq++) {
      for (let dr = -searchRange; dr <= searchRange; dr++) {
        const q = anchorQ + dq;
        const r = anchorR + dr;
        const pos = GridCoords.gridToWorld(q, r);

        const closestX = Math.max(minX, Math.min(pos.x, maxX));
        const closestZ = Math.max(minZ, Math.min(pos.z, maxZ));
        const dist = Math.hypot(pos.x - closestX, pos.z - closestZ);

        if (dist <= TILE_SIZE) {
          const key = `${q},${r}`;
          if (!seen.has(key)) {
            seen.add(key);
            cells.push({ q, r });
          }
        }
      }
    }

    return cells;
  }

  create(type: MapObjectType): THREE.Group {
    const group = new THREE.Group();
    group.userData = { type: "map-object", objectType: type };

    switch (type) {
      case "tree":
        this.addTree(group);
        break;
      case "rock":
        this.addRock(group);
        break;
    }

    return group;
  }

  private addTree(group: THREE.Group): void {
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
  }

  private addRock(group: THREE.Group): void {
    const rock = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.2, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.9 }),
    );
    rock.position.y = 0.1;
    group.add(rock);
  }

  private getFootprintBox(type: MapObjectType): THREE.Box3 {
    let box = this.footprintBoxes.get(type);
    if (!box) {
      const group = this.create(type);
      box = new THREE.Box3().setFromObject(group);
      this.footprintBoxes.set(type, box);
    }
    return box;
  }
}
