import * as THREE from "three";
import { UNIT_SPEED } from "../config/gameConfig.ts";
import type { GridPos } from "../world/GridCoords.ts";
import type { EntityAssets } from "./EntityAssets.ts";
import { Unit } from "./Unit.ts";

export const PLAYER_ID = "player";

const PLAYER_SIZE = 0.45;
const PLAYER_HEIGHT = 0.5;

export class Player extends Unit {
  constructor(spawn: GridPos, assets?: EntityAssets) {
    const group = Player.createMesh(assets);
    super(PLAYER_ID, spawn, group);
    this.speed = UNIT_SPEED;
  }

  private static createMesh(assets?: EntityAssets): THREE.Group {
    // Попытка загрузить модель из assets
    if (assets) {
      const model = assets.tryClone("player");
      if (model) {
        // Включаем тени для всех мешей в модели
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        model.userData = { type: "player", entityId: PLAYER_ID };
        return model;
      }
    }

    // Fallback: процедурная геометрия (куб)
    return Player.createProceduralMesh();
  }

  private static createProceduralMesh(): THREE.Group {
    const group = new THREE.Group();

    const geometry = new THREE.BoxGeometry(
      PLAYER_SIZE,
      PLAYER_HEIGHT,
      PLAYER_SIZE,
    );
    const material = new THREE.MeshStandardMaterial({ color: 0xe8c547 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = PLAYER_HEIGHT / 2;
    mesh.castShadow = true;
    group.add(mesh);

    group.userData = { type: "player", entityId: PLAYER_ID };

    return group;
  }
}

