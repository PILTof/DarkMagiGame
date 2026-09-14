import { beforeEach, describe, expect, it } from "vitest";
import { Unit } from "../../src/entities/Unit.ts";
import { cooldownCondition } from "../../src/skills/conditions/CooldownCondition.ts";
import type { SkillDefinition, CastConditionContext } from "../../src/skills/contracts/SkillDefinition.ts";

const timeProvider = { now: () => currentTime };
let currentTime = 100;

const skill: SkillDefinition = {
  id: "arcane-burst",
  radius: 4,
  range: 4,
  baseDamage: 6,
  cooldownSec: 2,
  conditions: [],
};

function createUnit(): Unit {
  const unit = Object.create(Unit.prototype) as Unit;
  (unit as unknown as { skillCooldowns: Map<string, number> }).skillCooldowns = new Map();
  return unit;
}

function createContext(caster: Unit, skillDefinition: SkillDefinition = skill): CastConditionContext {
  return {
    caster,
    target: { q: 0, r: 0 },
    tileMap: {} as never,
    skill: skillDefinition,
    timeProvider,
  };
}

describe("cooldownCondition", () => {
  beforeEach(() => {
    currentTime = 100;
  });

  it("allows skills without a cooldown", () => {
    const caster = createUnit();
    caster.startSkillCooldown(skill.id, 2_000, currentTime);
    const noCooldownSkill = { ...skill, cooldownSec: undefined };

    expect(cooldownCondition.validate(createContext(caster, noCooldownSkill))).toEqual({ isValid: true });
  });

  it("allows a first cast", () => {
    const caster = createUnit();

    expect(cooldownCondition.validate(createContext(caster))).toEqual({ isValid: true });
  });

  it("rejects a cast before the cooldown expires", () => {
    const caster = createUnit();
    caster.startSkillCooldown(skill.id, 2_000, currentTime);
    currentTime = 2_099;

    expect(cooldownCondition.validate(createContext(caster))).toEqual({
      isValid: false,
      reason: "Skill on cooldown.",
    });
  });

  it("allows a cast when the cooldown expires", () => {
    const caster = createUnit();
    caster.startSkillCooldown(skill.id, 2_000, currentTime);
    currentTime = 2_100;

    expect(cooldownCondition.validate(createContext(caster))).toEqual({ isValid: true });
  });
});
