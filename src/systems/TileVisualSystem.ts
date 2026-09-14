import * as THREE from "three";
import { TILE_SIZE } from "../config/gameConfig.ts";
import type { EventBus } from "../core/EventBus.ts";
import { GridCoords, type GridPos } from "../world/GridCoords.ts";
import type { TileMap } from "../world/TileMap.ts";
import type { System } from "./System.ts";
import { Effects, TileInteraction } from "./contracts/EventNamesInterface.ts";
import type { TargetPreviewPayload } from "./contracts/TileInteraction.ts";

type TimedEffect = { mesh: THREE.Mesh; remaining: number };

export class TileVisualSystem implements System {
  private readonly hover = this.createOverlay(0xffff00, 0.8);
  private readonly previewGroup = new THREE.Group();
  private readonly effects: TimedEffect[] = [];

  private readonly tileMap: TileMap;

  constructor(tileMap: TileMap, eventBus: EventBus) {
    this.tileMap = tileMap;
    this.hover.visible = false;
    this.tileMap.group.add(this.hover, this.previewGroup);
    eventBus.on(TileInteraction.target_preview_changed, (payload) => {
      this.setPreview(payload as TargetPreviewPayload);
    });
    eventBus.on(Effects.tile_click, (payload) => {
      const target = (payload as TargetPreviewPayload).target;
      if (target) this.playClick(target.grid);
    });
    eventBus.on(Effects.aoe_impact, (payload) => {
      const grid = (payload as { targetGrid: GridPos }).targetGrid;
      this.playImpact(grid);
    });
  }

  update(dt: number): void {
    for (let index = this.effects.length - 1; index >= 0; index--) {
      const effect = this.effects[index]!;
      effect.remaining -= dt;
      const material = effect.mesh.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0, effect.remaining / 0.35);
      effect.mesh.scale.setScalar(1 + (1 - material.opacity) * 0.5);
      if (effect.remaining <= 0) {
        this.tileMap.group.remove(effect.mesh);
        effect.mesh.geometry.dispose();
        material.dispose();
        this.effects.splice(index, 1);
      }
    }
  }

  private setPreview(preview: TargetPreviewPayload): void {
    this.clearPreview();
    if (!preview.target) {
      this.hover.visible = false;
      return;
    }

    this.positionAtGrid(this.hover, preview.target.grid);
    this.hover.visible = true;
    const hoverMaterial = this.hover.material as THREE.MeshBasicMaterial;
    hoverMaterial.color.set(preview.isValid ? 0x32ff5c : 0xff3333);

    if (!preview.isValid) return;
    for (const cell of preview.affectedCells) {
      const marker = this.createOverlay(0x42a5f5, 0.22);
      this.positionAtGrid(marker, cell);
      this.previewGroup.add(marker);
    }
  }

  private clearPreview(): void {
    while (this.previewGroup.children.length > 0) {
      const marker = this.previewGroup.children[this.previewGroup.children.length - 1];
      if (!marker) return;
      this.previewGroup.remove(marker);
      if (!(marker instanceof THREE.Mesh)) continue;
      marker.geometry.dispose();
      (marker.material as THREE.MeshBasicMaterial).dispose();
    }
  }

  private playClick(grid: GridPos): void {
    const effect = this.createOverlay(0xffffff, 0.75);
    this.positionAtGrid(effect, grid, 0.045);
    this.tileMap.group.add(effect);
    this.effects.push({ mesh: effect, remaining: 0.16 });
  }

  private playImpact(grid: GridPos): void {
    const effect = this.createOverlay(0xff8c00, 0.95);
    this.positionAtGrid(effect, grid, 0.05);
    this.tileMap.group.add(effect);
    this.effects.push({ mesh: effect, remaining: 0.35 });
  }

  private positionAtGrid(mesh: THREE.Mesh, grid: GridPos, y = 0.025): void {
    // Маркер добавлен в tileMap.group, поэтому позиционируем его в локальных
    // координатах группы, которая уже содержит смещение центрированной карты.
    const position = GridCoords.gridToWorld(grid.q, grid.r);
    mesh.position.set(position.x, y, position.z);
  }

  private createOverlay(color: number, opacity: number): THREE.Mesh {
    const geometry = new THREE.CircleGeometry(TILE_SIZE * 0.86, 6);
    geometry.rotateX(-Math.PI / 2);
    geometry.rotateY(Math.PI / 6);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    return new THREE.Mesh(geometry, material);
  }
}