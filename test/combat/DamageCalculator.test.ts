import { describe, expect, it } from "vitest";
import { calculateArmorReducedDamage } from "../../src/combat/DamageCalculator.ts";

describe("calculateArmorReducedDamage", () => {
  it("reduces damage by the armor formula", () => {
    expect(calculateArmorReducedDamage(100, 100)).toBe(50);
  });

  it("treats missing and negative armor as zero", () => {
    expect(calculateArmorReducedDamage(80, undefined)).toBe(80);
    expect(calculateArmorReducedDamage(80, -10)).toBe(80);
  });
});
