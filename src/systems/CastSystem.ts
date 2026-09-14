import { calculateArmorReducedDamage } from "../combat/DamageCalculator.ts";
import type { CastSkillCommand } from "../commands/CastSkillCommand.ts";
import type { EventBus } from "../core/EventBus.ts";
import type { EntityManager } from "../entities/EntityManager.ts";
import { Unit } from "../entities/Unit.ts";
import { getHexRadiusAffectedCells } from "../skills/HexRadiusTargeting.ts";
import type { SkillRegistry } from "../skills/SkillRegistry.ts";
import { GridCoords } from "../world/GridCoords.ts";
import { BoundsSystem } from "./BoundsSystem.ts";
import type { System } from "./System.ts";
import { Effects, PlayerCombat } from "./contracts/EventNamesInterface.ts";
import type { CastResolvedPayload } from "./contracts/TileInteraction.ts";
import type { TileMap } from "../world/TileMap.ts";
import type { HexGrid } from "../world/hex/HexGrid.ts";

export class CastSystem implements System {
  private readonly tileMap: TileMap;
  private readonly hexGrid: HexGrid;
  private readonly boundsSystem: BoundsSystem;
  private readonly eventBus: EventBus;
  private readonly entityManager: EntityManager;
  private readonly skillRegistry: SkillRegistry;

  constructor(
    tileMap: TileMap,
    hexGrid: HexGrid,
    boundsSystem: BoundsSystem,
    eventBus: EventBus,
    entityManager: EntityManager,
    skillRegistry: SkillRegistry,
  ) {
    this.tileMap = tileMap;
    this.hexGrid = hexGrid;
    this.boundsSystem = boundsSystem;
    this.eventBus = eventBus;
    this.entityManager = entityManager;
    this.skillRegistry = skillRegistry;
  }

  update(_dt: number): void {}

  /** Command handler: выполняет каст скилла. */
  handleCastSkill(command: CastSkillCommand): void {
    const caster = this.entityManager.get(command.casterId);
    if (!(caster instanceof Unit)) {
      this.reject("invalid-caster", command);
      return;
    }

    const skill = this.skillRegistry.get(command.skillId);
    if (!skill) {
      this.reject("invalid-skill", command);
      return;
    }

    if (!this.hexGrid.isInBounds(command.targetGrid.q, command.targetGrid.r)) {
      this.reject("invalid-tile", command);
      return;
    }

    const casterGrid = this.tileMap.worldToGrid(caster.position);
    if (GridCoords.distance(casterGrid, command.targetGrid) > skill.range) {
      this.reject("out-of-range", command);
      return;
    }

    const affectedCells = getHexRadiusAffectedCells(
      this.tileMap,
      command.targetGrid,
      skill.radius,
    );
    const hits: CastResolvedPayload["hits"] = [];

    for (const entity of this.entityManager.getAll()) {
      if (!(entity instanceof Unit) || entity.id === caster.id) continue;

      const boundHits = this.boundsSystem
        .getBoundsAtGrids(entity, affectedCells)
        .flatMap((bound) => {
          const grid = bound.boundGrid;
          if (!grid) return [];

          const armor = Math.max(bound.getBoundModifiers()?.armor ?? 0, 0);
          return [{
            grid: { q: grid.q, r: grid.r },
            armor,
            damage: calculateArmorReducedDamage(skill.baseDamage, armor),
          }];
        });
      if (boundHits.length === 0) continue;

      const damage = boundHits.reduce((total, hit) => total + hit.damage, 0);
      entity.takeDamage(damage);
      hits.push({ unitId: entity.id, damage, bounds: boundHits });
    }

    const resolved: CastResolvedPayload = {
      casterId: caster.id,
      skillId: command.skillId,
      targetGrid: command.targetGrid,
      affectedCells,
      hits,
    };
    this.eventBus.emit(PlayerCombat.cast_resolved, resolved);
    this.eventBus.emit(Effects.aoe_impact, resolved);
  }

  private reject(reason: string, command: CastSkillCommand): void {
    const targetWorldPos = this.tileMap.gridToWorldPosition(command.targetGrid.q, command.targetGrid.r);
    const tile = this.tileMap.getTile(command.targetGrid.q, command.targetGrid.r);
    
    if (!tile) {
      this.eventBus.emit(PlayerCombat.cast_rejected, { reason });
      return;
    }
    
    this.eventBus.emit(PlayerCombat.cast_rejected, { 
      reason,
      target: {
        grid: command.targetGrid,
        worldPosition: targetWorldPos,
        tile,
        pointerEvent: null as any, // No pointer event in command context
      },
    });
  }

}