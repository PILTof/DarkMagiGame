import type { CastCondition } from "../contracts/SkillDefinition";

export const cooldownCondition: CastCondition = {
  id: "cooldown",
  validate: ({ caster, skill, timeProvider }) => {
    if (skill.cooldownSec === undefined) {
      return { isValid: true };
    }

    if (!caster) {
      return { isValid: true };
    }

    const nowMs = timeProvider.now();
    return caster.isSkillReady(skill.id, nowMs)
      ? { isValid: true }
      : { isValid: false, reason: "Skill on cooldown." };
  },
};
