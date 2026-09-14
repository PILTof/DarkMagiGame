import { casterExistsCondition } from "./conditions/CasterExistsCondition.ts";
import { cooldownCondition } from "./conditions/CooldownCondition.ts";
import { targetInRangeCondition } from "./conditions/TargetInRangeCondition.ts";
import type { SkillDefinition } from "./contracts/SkillDefinition.ts";

export const ARCANE_BURST: SkillDefinition = {
    id: "arcane-burst",
    radius: 2,
    range: 4,
    baseDamage: 6,
    cooldownSec: 2,
    conditions: [
        casterExistsCondition,
        cooldownCondition,
        targetInRangeCondition,
    ],
};
