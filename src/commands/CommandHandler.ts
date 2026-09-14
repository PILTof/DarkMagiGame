import type { MoveUnitCommand } from "./MoveUnitCommand.ts";
import type { StopUnitCommand } from "./StopUnitCommand.ts";
import type { CastSkillCommand } from "./CastSkillCommand.ts";

/**
 * Command handler interface.
 * Системы реализуют методы для обработки конкретных команд.
 */
export interface CommandHandler {
  handleMoveUnit?(command: MoveUnitCommand): void;
  handleStopUnit?(command: StopUnitCommand): void;
  handleCastSkill?(command: CastSkillCommand): void;
}
