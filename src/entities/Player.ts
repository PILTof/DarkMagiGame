import * as THREE from "three";
import { UNIT_SPEED } from "../config/gameConfig.ts";
import type { GridPos } from "../world/GridCoords.ts";
import type { EntityAssets } from "./EntityAssets.ts";
import { Unit } from "./Unit.ts";

export const PLAYER_ID = "player";

const PLAYER_SIZE = 0.45;
const PLAYER_HEIGHT = 0.5;
const PLAYER_MODEL_HEIGHT = 1.0; // Целевая высота для загруженной модели

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
        Player.setupModel(model, PLAYER_MODEL_HEIGHT);
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

  /**
   * Настраивает загруженную модель: масштабирует, центрирует и ставит на землю
   * Применяет трансформации напрямую к модели без создания обертки
   */
  private static setupModel(model: THREE.Group, targetHeight: number): void {
    // Включаем тени для всех мешей в модели
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Вычисляем bounding box
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Масштабируем до целевой высоты
    if (size.y > 0) {
      const scale = targetHeight / size.y;
      model.scale.multiplyScalar(scale);
    }

    // Пересчитываем bounding box после масштабирования
    const fitted = new THREE.Box3().setFromObject(model);
    
    // Центрируем по XZ и ставим на землю (y = 0)
    // Применяем смещение напрямую к модели
    model.position.set(
      -(fitted.min.x + fitted.max.x) / 2,
      -fitted.min.y,
      -(fitted.min.z + fitted.max.z) / 2,
    );

    // ВАЖНО: Применяем трансформации к геометрии и обнуляем локальную позицию
    model.updateMatrixWorld(true);
    
    // Собираем все дочерние объекты и применяем к ним матрицу трансформации
    const children: THREE.Object3D[] = [];
    model.traverse((child) => {
      if (child !== model) {
        children.push(child);
      }
    });

    // Применяем текущую матрицу модели к дочерним объектам
    const matrix = model.matrix.clone();
    children.forEach((child) => {
      child.applyMatrix4(matrix);
    });

    // Обнуляем трансформации модели
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    model.updateMatrix();
  }
}

