import { describe, it, expect } from "vitest";
import { SkillRegistry } from "./SkillRegistry.ts";
import { ARCANE_BURST } from "./ArcaneBurst.ts";

describe("SkillRegistry", () => {
  it("registers and retrieves skills", () => {
    const registry = new SkillRegistry();
    registry.register(ARCANE_BURST);
    
    expect(registry.has(ARCANE_BURST.id)).toBe(true);
    expect(registry.get(ARCANE_BURST.id)).toBe(ARCANE_BURST);
    expect(registry.getAll()).toEqual([ARCANE_BURST]);
  });

  it("throws when registering duplicate skill id", () => {
    const registry = new SkillRegistry();
    registry.register(ARCANE_BURST);
    
    expect(() => registry.register(ARCANE_BURST)).toThrow('Skill with id "arcane-burst" is already registered');
  });

  it("returns undefined for unknown skill", () => {
    const registry = new SkillRegistry();
    expect(registry.get("unknown")).toBeUndefined();
    expect(registry.has("unknown")).toBe(false);
  });
});
