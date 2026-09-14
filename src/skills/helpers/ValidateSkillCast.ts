import type { CastConditionContext, CastConditionResult } from "../contracts/SkillDefinition";

/**
 * Валидирует каст скилла, выполняя все условия из skill.conditions.
 * Останавливается на первом неудачном условии и возвращает его результат.
 */
export function ValidateSkillCast(context: CastConditionContext): CastConditionResult {
  for (const condition of context.skill.conditions) {
    const result = condition.validate(context);
    if (!result.isValid) return result;
  }
  return { isValid: true };
}
