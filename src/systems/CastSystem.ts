import { calculateArmorReducedDamage } from "../combat/DamageCalculator.ts";
import type { EventBus } from "../core/EventBus.ts";
import type { EntityManager } from "../entities/EntityManager.ts";
import { Unit } from "../entities/Unit.ts";
import { ARCANE_BURST } from "../skills/ArcaneBurst.ts";
import { getHexRadiusAffectedCells } from "../skills/HexRadiusTargeting.ts";
import { GridCoords } from "../world/GridCoords.ts";
import { BoundsSystem } from "./BoundsSystem.ts";
import type { System } from "./System.ts";
import { Effects, PlayerCombat } from "./contracts/EventNamesInterface.ts";
import type { CastRequest, CastResolvedPayload } from "./contracts/TileInteraction.ts";
import type { TileMap } from "../world/TileMap.ts";

export class CastSystem implements System {
  private readonly tileMap: TileMap;
  private readonly boundsSystem: BoundsSystem;
  private readonly eventBus: EventBus;
  private readonly entityManager: EntityManager;

  constructor(
    tileMap: TileMap,
    boundsSystem: BoundsSystem,
    eventBus: EventBus,
    entityManager: EntityManager,
  ) {
    this.tileMap = tileMap;
    this.boundsSystem = boundsSystem;
    this.eventBus = eventBus;
    this.entityManager = entityManager;
    this.eventBus.on(PlayerCombat.cast_spell, (payload) => {
      this.cast(payload as CastRequest);
    });
  }

  update(_dt: number): void {}

  private cast(request: CastRequest): void {
    const caster = this.entityManager.get(request.casterId);
    if (!(caster instanceof Unit) || request.skillId !== ARCANE_BURST.id) {
      this.reject("invalid-skill", request);
      return;
    }
    if (!this.tileMap.getTile(request.target.grid.q, request.target.grid.r)) {
      this.reject("invalid-tile", request);
      return;
    }

    const casterGrid = this.tileMap.worldToGrid(caster.position);
    if (GridCoords.distance(casterGrid, request.target.grid) > ARCANE_BURST.range) {
      this.reject("out-of-range", request);
      return;
    }

    const affectedCells = getHexRadiusAffectedCells(
      this.tileMap,
      request.target.grid,
      ARCANE_BURST.radius,
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
            damage: calculateArmorReducedDamage(ARCANE_BURST.baseDamage, armor),
          }];
        });
      if (boundHits.length === 0) continue;

      const damage = boundHits.reduce((total, hit) => total + hit.damage, 0);
      entity.takeDamage(damage);
      hits.push({ unitId: entity.id, damage, bounds: boundHits });
    }

    const resolved: CastResolvedPayload = {
      casterId: caster.id,
      skillId: request.skillId,
      targetGrid: request.target.grid,
      affectedCells,
      hits,
    };
    this.eventBus.emit(PlayerCombat.cast_resolved, resolved);
    this.eventBus.emit(Effects.aoe_impact, resolved);
  }

  private reject(reason: string, request: CastRequest): void {
    this.eventBus.emit(PlayerCombat.cast_rejected, { reason, request });
  }

}