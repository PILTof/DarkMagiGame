import * as THREE from "three";
import type { EventBus } from "../core/EventBus.ts";
import type { Engine } from "../engine/Engine.ts";
import type { IsometricCamera } from "../engine/IsometricCamera.ts";
import type { EntityManager } from "../entities/EntityManager.ts";
import type { TileMap } from "../world/TileMap.ts";
import type { System } from "./System.ts";

export type PlayerMovePayload = { x: number; z: number };

export class InputSystem implements System {
  private readonly engine: Engine;
  private readonly camera: IsometricCamera;
  private readonly tileMap: TileMap;
  private readonly entityManager: EntityManager;
  private readonly eventBus: EventBus;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();

  constructor(
    engine: Engine,
    camera: IsometricCamera,
    tileMap: TileMap,
    entityManager: EntityManager,
    eventBus: EventBus,
  ) {
    this.engine = engine;
    this.camera = camera;
    this.tileMap = tileMap;
    this.entityManager = entityManager;
    this.eventBus = eventBus;

    const canvas = this.engine.renderer.domElement;
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("pointerdown", (e) => this.onPointerDown(e));
  }

  update(_dt: number): void {}

  private onPointerDown(event: PointerEvent): void {
    if (event.button !== 2) return;

    // Сначала проверяем клик на баунд врага
    const boundHit = this.pickEnemyBound(event);
    if (boundHit) {
      console.log(`🎯 Clicked on enemy bound! Entity ID: ${boundHit.entityId}`);
      this.eventBus.emit("enemy:bound-clicked", { entityId: boundHit.entityId });
      return;
    }

    // Если не попали на баунд, то обрабатываем движение
    const target = this.pickWorldPosition(event);
    if (!target) return;

    const payload: PlayerMovePayload = { x: target.x, z: target.z };
    this.eventBus.emit("player:move-to", payload);
  }

  private pickWorldPosition(event: PointerEvent): THREE.Vector3 | null {
    const rect = this.engine.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera.camera);
    // recursive: GLTF tiles are Groups; geometry lives on nested meshes (hex + decorations)
    const hits = this.raycaster.intersectObjects(
      this.tileMap.group.children,
      true,
    );

    for (const hit of hits) {
      if (!this.findTileRoot(hit.object)) continue;
      return new THREE.Vector3(hit.point.x, 0, hit.point.z);
    }

    return null;
  }

  /** Walk up from a nested mesh to the tile root that carries userData.type === "tile". */
  private findTileRoot(object: THREE.Object3D): THREE.Object3D | null {
    let current: THREE.Object3D | null = object;
    while (current) {
      if (current.userData.type === "tile") return current;
      current = current.parent;
    }
    return null;
  }

  /**
   * Проверяет, попал ли клик на баунд врага
   * @returns объект с entityId если попали на баунд врага, иначе null
   */
  private pickEnemyBound(event: PointerEvent): { entityId: string } | null {
    const rect = this.engine.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera.camera);
    
    // Получаем все сущности и проверяем их баунды
    const entities = this.entityManager.getAll();
    
    for (const entity of entities) {
      // Пропускаем игрока
      if (entity.id === "player") continue;
      
      // Проверяем пересечение с mesh сущности (включая все дочерние объекты)
      const hits = this.raycaster.intersectObject(entity.mesh, true);
      
      for (const hit of hits) {
        // Ищем баунд в иерархии
        const bound = this.findBound(hit.object);
        if (bound && bound.userData.isBound) {
          return { entityId: bound.userData.entityId };
        }
      }
    }
    
    return null;
  }

  /**
   * Ищет объект с userData.isBound === true в иерархии
   */
  private findBound(object: THREE.Object3D): THREE.Object3D | null {
    let current: THREE.Object3D | null = object;
    while (current) {
      if (current.userData.isBound === true) return current;
      current = current.parent;
    }
    return null;
  }
}
