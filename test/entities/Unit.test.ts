import { describe, expect, it } from "vitest";
import { Unit } from "../../src/entities/Unit.ts";

function createUnit(): Unit {
  const unit = Object.create(Unit.prototype) as Unit;
  (unit as unknown as { skillCooldowns: Map<string, number> }).skillCooldowns = new Map();
  return unit;
}

describe("Unit skill cooldowns", () => {
  it("tracks cooldowns independently for each skill", () => {
    const unit = createUnit();

    unit.startSkillCooldown("arcane-burst", 2_000, 100);

    expect(unit.isSkillReady("arcane-burst", 2_099)).toBe(false);
    expect(unit.isSkillReady("other-skill", 2_099)).toBe(true);
  });

  it("uses the supplied time to determine readiness", () => {
    const unit = createUnit();

    unit.startSkillCooldown("arcane-burst", 2_000, 100);

    expect(unit.isSkillReady("arcane-burst", 2_099)).toBe(false);
    expect(unit.isSkillReady("arcane-burst", 2_100)).toBe(true);
  });
});
