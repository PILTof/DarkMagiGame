import * as THREE from "three";
import type { EventBus } from "../core/EventBus.ts";
import type { Engine } from "../engine/Engine.ts";
import type { IsometricCamera } from "../engine/IsometricCamera.ts";
import type { TileMap } from "../world/TileMap.ts";
import type { System } from "./System.ts";

export type PlayerMovePayload = { x: number; z: number };

export class InputSystem implements System {
  private readonly engine: Engine;
  private readonly camera: IsometricCamera;
  private readonly tileMap: TileMap;
  private readonly eventBus: EventBus;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();

  constructor(
    engine: Engine,
    camera: IsometricCamera,
    tileMap: TileMap,
    eventBus: EventBus,
  ) {
    this.engine = engine;
    this.camera = camera;
    this.tileMap = tileMap;
    this.eventBus = eventBus;

    const canvas = this.engine.renderer.domElement;
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("pointerdown", (e) => this.onPointerDown(e));
  }

  update(_dt: number): void {}

  private onPointerDown(event: PointerEvent): void {
    if (event.button !== 2) return;

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
}
