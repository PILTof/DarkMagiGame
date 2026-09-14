import { describe, it, expect } from "vitest";
import { ActiveSkillSlot } from "../../src/skills/ActiveSkillSlot.ts";
import { ARCANE_BURST } from "../../src/skills/ArcaneBurst.ts";

describe("ActiveSkillSlot", () => {
  it("starts empty", () => {
    const slot = new ActiveSkillSlot();
    expect(slot.getActive()).toBeNull();
    expect(slot.hasActive()).toBe(false);
  });

  it("sets and gets active skill", () => {
    const slot = new ActiveSkillSlot();
    slot.setActive(ARCANE_BURST);
    
    expect(slot.getActive()).toBe(ARCANE_BURST);
    expect(slot.hasActive()).toBe(true);
  });

  it("clears active skill", () => {
    const slot = new ActiveSkillSlot();
    slot.setActive(ARCANE_BURST);
    slot.clear();
    
    expect(slot.getActive()).toBeNull();
    expect(slot.hasActive()).toBe(false);
  });
});
