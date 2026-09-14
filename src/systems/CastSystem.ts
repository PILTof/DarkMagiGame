import type { Scene } from "three";
import type { EventBus } from "../core/EventBus.ts";
import { EntityManager } from "../entities/EntityManager.ts";
import { Unit } from "../entities/Unit.ts";
import { GridCoords, type GridPos } from "../world/GridCoords.ts";
import type { TileMap } from "../world/TileMap.ts";
import { BoundsSystem } from "./BoundsSystem.ts";
import type { System } from "./System.ts";
import { Effects, PlayerCombat } from "./contracts/EventNamesInterface.ts";
import type { CastRequest, CastResolvedPayload } from "./contracts/TileInteraction.ts";
import { ARCANE_BURST } from "./TileInteractionSystem.ts";

export class CastSystem implements System {
  private readonly scene: Scene;
  private readonly tileMap: TileMap;
  private readonly boundsSystem: BoundsSystem;
  private readonly eventBus: EventBus;

  constructor(
    scene: Scene,
    tileMap: TileMap,
    boundsSystem: BoundsSystem,
    eventBus: EventBus,
  ) {
    this.scene = scene;
    this.tileMap = tileMap;
    this.boundsSystem = boundsSystem;
    this.eventBus = eventBus;
    this.eventBus.on(PlayerCombat.cast_spell, (payload) => {
      this.cast(payload as CastRequest);
    });
  }

  update(_dt: number): void {
    for (const entity of EntityManager.getInstance().getAll()) {
      if (entity instanceof Unit && !entity.isAlive()) {
        EntityManager.getInstance().remove(entity.id, this.scene);
      }
    }
  }

  private cast(request: CastRequest): void {
    const caster = EntityManager.getInstance().get(request.casterId);
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

    const affectedCells = this.getAffectedCells(request.target.grid);
    const hits: CastResolvedPayload["hits"] = [];

    for (const entity of EntityManager.getInstance().getAll()) {
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
            damage: ARCANE_BURST.baseDamage * (100 / (100 + armor)),
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

  private getAffectedCells(center: GridPos): GridPos[] {
    const cells: GridPos[] = [];
    for (let r = 0; r < this.tileMap.height; r++) {
      for (let q = 0; q < this.tileMap.width; q++) {
        const cell = { q, r };
        if (GridCoords.distance(center, cell) <= ARCANE_BURST.radius) cells.push(cell);
      }
    }
    return cells;
  }

  private reject(reason: string, request: CastRequest): void {
    this.eventBus.emit(PlayerCombat.cast_rejected, { reason, request });
  }

}