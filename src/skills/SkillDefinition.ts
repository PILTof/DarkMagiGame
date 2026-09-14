import type { Unit } from "../entities/Unit.ts";
import type { GridPos } from "../world/GridCoords.ts";
import type { TileMap } from "../world/TileMap.ts";

export type CastConditionContext = {
  caster: Unit | undefined;
  target: GridPos;
  tileMap: TileMap;
  skill: Pick<SkillDefinition, "range">;
};

export type CastConditionResult = {
  isValid: boolean;
  reason?: string;
};

export type CastCondition = {
  id: string;
  validate(context: CastConditionContext): CastConditionResult;
};

export type SkillDefinition = {
  id: string;
  radius: number;
  range: number;
  baseDamage: number;
  conditions: readonly CastCondition[];
};
