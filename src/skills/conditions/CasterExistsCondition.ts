import type { CastCondition } from "../contracts/SkillDefinition";

export const casterExistsCondition: CastCondition = {
  id: "caster-exists",
  validate: ({ caster }) =>
    caster
      ? { isValid: true }
      : { isValid: false, reason: "No caster is available." },
};
