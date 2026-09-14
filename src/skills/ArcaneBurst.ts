import { GridCoords } from "../world/GridCoords.ts";
import type { CastCondition, SkillDefinition } from "./SkillDefinition.ts";

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

export const ARCANE_BURST: SkillDefinition = {
  id: "arcane-burst",
  radius: 4,
  range: 4,
  baseDamage: 6,
  conditions: [casterExistsCondition, targetInRangeCondition],
};
