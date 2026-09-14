import { GridCoords } from "../../world/GridCoords";
import type { CastCondition } from "../contracts/SkillDefinition";

export const targetInRangeCondition: CastCondition = {
    id: "target-in-range",
    validate: ({ caster, target, tileMap, skill }) => {
        if (!caster) return { isValid: true };

        const casterGrid = tileMap.worldToGrid(caster.position);
        const distance = GridCoords.distance(casterGrid, target);
        return distance <= skill.range
            ? { isValid: true }
            : {
                  isValid: false,
                  reason: `Target is out of range (${distance}/${skill.range}).`,
              };
    },
};
