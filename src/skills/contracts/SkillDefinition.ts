import type { TimeProvider } from "../../core/TimeProvider";
import type { Unit } from "../../entities/Unit";
import type { GridPos } from "../../world/GridCoords";
import type { TileMap } from "../../world/TileMap";


export type CastConditionContext = {
  caster: Unit | undefined;
  target: GridPos;
  tileMap: TileMap;
  skill: SkillDefinition;
  timeProvider: TimeProvider;
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
  cooldownSec?: number;
  conditions: readonly CastCondition[];
};
