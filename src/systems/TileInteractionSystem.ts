import type { EventBus } from "../core/EventBus.ts";
import type { EntityManager } from "../entities/EntityManager.ts";
import { getHexRadiusAffectedCells } from "../skills/HexRadiusTargeting.ts";
import type { ActiveSkillSlot } from "../skills/ActiveSkillSlot.ts";
import type { CastConditionContext, CastConditionResult } from "../skills/SkillDefinition.ts";
import type { TileMap } from "../world/TileMap.ts";
import type { System } from "./System.ts";
import { Effects, PlayerCombat, TileInteraction } from "./contracts/EventNamesInterface.ts";
import type { TargetPreviewPayload, TilePointerPayload } from "./contracts/TileInteraction.ts";
import type { CommandDispatcher } from "../commands/CommandDispatcher.ts";
import type { CastSkillCommand } from "../commands/CastSkillCommand.ts";

export class TileInteractionSystem implements System {
  private readonly tileMap: TileMap;
  private readonly eventBus: EventBus;
  private readonly entityManager: EntityManager;
  private readonly activeSkillSlot: ActiveSkillSlot;
  private readonly commandDispatcher: CommandDispatcher;
  private targetingActive = false;

  constructor(
    tileMap: TileMap,
    eventBus: EventBus,
    entityManager: EntityManager,
    activeSkillSlot: ActiveSkillSlot,
    commandDispatcher: CommandDispatcher,
  ) {
    this.tileMap = tileMap;
    this.eventBus = eventBus;
    this.entityManager = entityManager;
    this.activeSkillSlot = activeSkillSlot;
    this.commandDispatcher = commandDispatcher;
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
    
    const activeSkill = this.activeSkillSlot.getActive();
    if (!activeSkill) return;

    const preview = this.createPreview(target);
    this.eventBus.emit(Effects.tile_click, preview);
    
    if (!preview.isValid) {
      this.eventBus.emit(PlayerCombat.cast_rejected, {
        reason: preview.invalidReason ?? "Skill cannot be cast on this tile.",
        target,
      });
      return;
    }

    const player = this.entityManager.getPlayer();
    if (!player) return;

    // Dispatch command instead of event
    const command: CastSkillCommand = {
      casterId: player.id,
      skillId: activeSkill.id,
      targetGrid: target.grid,
    };
    
    this.commandDispatcher.dispatchCastSkill(command);
  }

  private createPreview(target: TilePointerPayload | null): TargetPreviewPayload {
    if (!target) return { target: null, affectedCells: [], isValid: false };
    
    const activeSkill = this.activeSkillSlot.getActive();
    if (!activeSkill) return { target: null, affectedCells: [], isValid: false };

    const affectedCells = getHexRadiusAffectedCells(
      this.tileMap,
      target.grid,
      activeSkill.radius,
    );
    const validation = this.validateCast(target.grid, activeSkill);
    return {
      target,
      affectedCells,
      isValid: validation.isValid,
      ...(validation.reason ? { invalidReason: validation.reason } : {}),
    };
  }

  private validateCast(target: { q: number; r: number }, skill: import("../skills/SkillDefinition.ts").SkillDefinition): CastConditionResult {
    if (!this.tileMap.getTile(target.q, target.r)) {
      return { isValid: false, reason: "Target tile does not exist." };
    }

    const caster = this.entityManager.getPlayer();
    const context: CastConditionContext = {
      caster,
      target,
      tileMap: this.tileMap,
      skill,
    };

    for (const condition of skill.conditions) {
      const result = condition.validate(context);
      if (!result.isValid) return result;
    }
    return { isValid: true };
  }

}