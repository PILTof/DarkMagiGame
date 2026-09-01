import * as THREE from "three";
import type { MapObjectType } from "./MapData.ts";

export class MapObjects {
  private readonly blockingTypes = new Set<MapObjectType>(["tree", "rock"]);

  isBlocking(type: MapObjectType): boolean {
    return this.blockingTypes.has(type);
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
}
