import type { EventBus } from "../core/EventBus.ts";
import { EntityManager } from "../entities/EntityManager.ts";
import type { Unit } from "../entities/Unit.ts";
import { GridCoords, type GridPos } from "../world/GridCoords.ts";
import type { TileMap } from "../world/TileMap.ts";
import type { System } from "./System.ts";
import { Effects, PlayerCombat, TileInteraction } from "./contracts/EventNamesInterface.ts";
import type { CastRequest, TargetPreviewPayload, TilePointerPayload } from "./contracts/TileInteraction.ts";

type CastConditionContext = {
  caster: Unit | undefined;
  target: GridPos;
  tileMap: TileMap;
  skill: { range: number };
};

type CastConditionResult = {
  isValid: boolean;
  reason?: string;
};

type CastCondition = {
  id: string;
  validate(context: CastConditionContext): CastConditionResult;
};

const casterExistsCondition: CastCondition = {
  id: "caster-exists",
  validate: ({ caster }) =>
    caster
      ? { isValid: true }
      : { isValid: false, reason: "No caster is available." },
};

const targetInRangeCondition: CastCondition = {
  id: "target-in-range",
  validate: ({ caster, target, tileMap, skill }) => {
    if (!caster) return { isValid: true };
    const casterGrid = tileMap.worldToGrid(caster.position);
    const distance = GridCoords.distance(casterGrid, target);
    return distance <= skill.range
      ? { isValid: true }
      : { isValid: false, reason: `Target is out of range (${distance}/${skill.range}).` };
  },
};

export const ARCANE_BURST = {
  id: "arcane-burst",
  radius: 4,
  range: 4,
  baseDamage: 6,
  conditions: [casterExistsCondition, targetInRangeCondition] as CastCondition[],
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
      this.eventBus.emit(PlayerCombat.cast_rejected, {
        reason: preview.invalidReason ?? "Skill cannot be cast on this tile.",
        target,
      });
      return;
    }

    const player = EntityManager.getInstance().getPlayer();
    if (!player) return;

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
    const validation = this.validateCast(target.grid);
    return {
      target,
      affectedCells,
      isValid: validation.isValid,
      ...(validation.reason ? { invalidReason: validation.reason } : {}),
    };
  }

  private validateCast(target: GridPos): CastConditionResult {
    if (!this.tileMap.getTile(target.q, target.r)) {
      return { isValid: false, reason: "Target tile does not exist." };
    }

    const caster = EntityManager.getInstance().getPlayer();
    const context: CastConditionContext = {
      caster,
      target,
      tileMap: this.tileMap,
      skill: ARCANE_BURST,
    };

    for (const condition of ARCANE_BURST.conditions) {
      const result = condition.validate(context);
      if (!result.isValid) return result;
    }
    return { isValid: true };
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