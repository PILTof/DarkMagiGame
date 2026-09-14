import * as THREE from "three";
import type { EventBus } from "../core/EventBus.ts";
import type { Engine } from "../engine/Engine.ts";
import type { IsometricCamera } from "../engine/IsometricCamera.ts";
import type { EntityManager } from "../entities/EntityManager.ts";
import type { TileMap } from "../world/TileMap.ts";
import type { System } from "./System.ts";
import { PlayerMovement, TileInteraction } from "./contracts/EventNamesInterface.ts";
import type { TilePointerPayload } from "./contracts/TileInteraction.ts";

export type PlayerMovePayload = { x: number; z: number; event: Event };

export class InputSystem implements System {
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly mapPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly planeHit = new THREE.Vector3();
  private readonly targetingIndicator: HTMLDivElement;
  private hoveredTileKey: string | null = null;
  private hoveredTile: TilePointerPayload | null = null;
  private targetingActive = false;

  private readonly engine: Engine;
  private readonly camera: IsometricCamera;
  private readonly tileMap: TileMap;
  private readonly eventBus: EventBus;

  constructor(
    engine: Engine,
    camera: IsometricCamera,
    tileMap: TileMap,
    _entityManager: EntityManager,
    eventBus: EventBus,
  ) {
    this.engine = engine;
    this.camera = camera;
    this.tileMap = tileMap;
    this.eventBus = eventBus;
    const canvas = this.engine.renderer.domElement;
    this.targetingIndicator = this.createTargetingIndicator(canvas);
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    canvas.addEventListener("pointermove", (event) => this.onPointerMove(event));
    canvas.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    canvas.addEventListener("pointerleave", () => this.clearHover());
    window.addEventListener("keydown", (event) => this.onKeyDown(event));
  }

  update(_dt: number): void {}

  private onPointerMove(event: PointerEvent): void {
    const target = this.pickTile(event);
    const key = target ? `${target.grid.q},${target.grid.r}` : null;
    if (key === this.hoveredTileKey) return;

    this.hoveredTileKey = key;
    this.hoveredTile = target;
    this.eventBus.emit(TileInteraction.pointer_move, target);
    this.eventBus.emit(TileInteraction.hover_changed, target);
  }

  private onPointerDown(event: PointerEvent): void {
    if (event.button === 2) {
      this.setTargetingActive(false);
    }

    const target = this.pickTile(event);
    if (!target) return;

    if (event.button === 2) {
      const payload: PlayerMovePayload = {
        x: target.worldPosition.x,
        z: target.worldPosition.z,
        event,
      };
      this.eventBus.emit(PlayerMovement.move_to, payload);
      return;
    }

    if (event.button === 0 && this.targetingActive) {
      this.eventBus.emit(TileInteraction.pointer_click, target);
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.code !== "KeyW" || event.repeat) return;
    this.setTargetingActive(!this.targetingActive);
  }

  private setTargetingActive(active: boolean): void {
    if (this.targetingActive === active) return;
    this.targetingActive = active;
    this.targetingIndicator.textContent = `AoE targeting [W]: ${active ? "ON" : "OFF"}`;
    this.targetingIndicator.style.background = active ? "rgba(28, 113, 48, 0.92)" : "rgba(40, 40, 48, 0.9)";
    this.eventBus.emit(TileInteraction.targeting_changed, { active });
    this.eventBus.emit(TileInteraction.pointer_move, this.hoveredTile);
  }

  private clearHover(): void {
    if (!this.hoveredTileKey) return;
    this.hoveredTileKey = null;
    this.hoveredTile = null;
    this.eventBus.emit(TileInteraction.pointer_move, null);
    this.eventBus.emit(TileInteraction.hover_changed, null);
  }

  private pickTile(event: PointerEvent): TilePointerPayload | null {
    const rect = this.engine.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera.camera);

    if (!this.raycaster.ray.intersectPlane(this.mapPlane, this.planeHit)) {
      return null;
    }

    const grid = this.tileMap.worldToGrid(this.planeHit);
    const tile = this.tileMap.getTile(grid.q, grid.r);
    if (!tile) return null;

    return {
      grid,
      worldPosition: this.tileMap.gridToWorldPosition(grid.q, grid.r),
      tile,
      pointerEvent: event,
    };
  }

  private createTargetingIndicator(canvas: HTMLCanvasElement): HTMLDivElement {
    const indicator = document.createElement("div");
    indicator.textContent = "AoE targeting [W]: OFF";
    Object.assign(indicator.style, {
      position: "fixed",
      top: "12px",
      left: "12px",
      zIndex: "1000",
      padding: "8px 10px",
      border: "1px solid #a0a0b0",
      borderRadius: "4px",
      background: "rgba(40, 40, 48, 0.9)",
      color: "#ffffff",
      fontFamily: "monospace",
      fontSize: "14px",
      pointerEvents: "none",
    });
    canvas.parentElement?.appendChild(indicator);
    return indicator;
  }
}
