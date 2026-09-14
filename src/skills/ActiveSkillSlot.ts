import type { SkillDefinition } from "./contracts/SkillDefinition";

/**
 * Active skill slot — текущий выбранный скилл игрока для UI hotbar.
 */
export class ActiveSkillSlot {
  private current: SkillDefinition | null = null;

  setActive(skill: SkillDefinition): void {
    this.current = skill;
  }

  getActive(): SkillDefinition | null {
    return this.current;
  }

  clear(): void {
    this.current = null;
  }

  hasActive(): boolean {
    return this.current !== null;
  }
}
