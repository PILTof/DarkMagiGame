import type { EventBus } from "../core/EventBus.ts";
import { EntityManager } from "../entities/EntityManager.ts";
import { GridCoords, type GridPos } from "../world/GridCoords.ts";
import type { TileMap } from "../world/TileMap.ts";
import type { System } from "./System.ts";
import { Effects, PlayerCombat, TileInteraction } from "./contracts/EventNamesInterface.ts";
import type { CastRequest, TargetPreviewPayload, TilePointerPayload } from "./contracts/TileInteraction.ts";

export const ARCANE_BURST = {
  id: "arcane-burst",
  radius: 4,
  range: 4,
  baseDamage: 6,
} as const;

export class TileInteractionSystem implements System {
  private readonly tileMap: TileMap;
  private readonly eventBus: EventBus;
  private targetingActive = false;

  constructor(tileMap: TileMap, eventBus: EventBus) {
    this.tileMap = tileMap;
    this.eventBus = eventBus;
    this.eventBus.on(TileInteraction.pointer_move, (payload) => {
      this.onPointerMove(payload as TilePointerPayload | null);
    });
    this.eventBus.on(TileInteraction.pointer_click, (payload) => {
      this.onPointerClick(payload as TilePointerPayload);
    });
    this.eventBus.on(TileInteraction.targeting_changed, (payload) => {
      this.targetingActive = (payload as { active: boolean }).active;
    });
  }

  update(_dt: number): void {}

  private onPointerMove(target: TilePointerPayload | null): void {
    this.eventBus.emit(
      TileInteraction.target_preview_changed,
      this.targetingActive ? this.createPreview(target) : this.createPreview(null),
    );
  }

  private onPointerClick(target: TilePointerPayload): void {
    if (!this.targetingActive) return;
    const preview = this.createPreview(target);
    this.eventBus.emit(Effects.tile_click, preview);
    if (!preview.isValid) {
      this.eventBus.emit(PlayerCombat.cast_rejected, { reason: "invalid-tile", target });
      return;
    }

    const player = EntityManager.getInstance().getPlayer();
    if (!player) {
      this.eventBus.emit(PlayerCombat.cast_rejected, { reason: "no-caster", target });
      return;
    }

    const request: CastRequest = {
      casterId: player.id,
      skillId: ARCANE_BURST.id,
      target,
    };
    this.eventBus.emit(PlayerCombat.cast_spell, request);
  }

  private createPreview(target: TilePointerPayload | null): TargetPreviewPayload {
    if (!target) return { target: null, affectedCells: [], isValid: false };
    const affectedCells = this.getAffectedCells(target.grid);
    return {
      target,
      affectedCells,
      isValid: this.canTarget(target.grid),
    };
  }

  private canTarget(target: GridPos): boolean {
    if (!this.tileMap.getTile(target.q, target.r)) return false;
    const player = EntityManager.getInstance().getPlayer();
    if (!player) return false;
    const playerGrid = this.tileMap.worldToGrid(player.position);
    return GridCoords.distance(playerGrid, target) <= ARCANE_BURST.range;
  }

  private getAffectedCells(center: GridPos): GridPos[] {
    const cells: GridPos[] = [];
    for (let r = 0; r < this.tileMap.height; r++) {
      for (let q = 0; q < this.tileMap.width; q++) {
        const cell = { q, r };
        if (GridCoords.distance(center, cell) <= ARCANE_BURST.radius) {
          cells.push(cell);
        }
      }
    }
    return cells;
  }
}