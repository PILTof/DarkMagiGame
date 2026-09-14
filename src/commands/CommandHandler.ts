import type { CastSkillCommand } from "./contracts/CastSkillCommand";
import type { MoveUnitCommand } from "./contracts/MoveUnitCommand";
import type { StopUnitCommand } from "./contracts/StopUnitCommand";

/**
 * Command handler interface.
 * Системы реализуют методы для обработки конкретных команд.
 */
export interface CommandHandler {
  handleMoveUnit?(command: MoveUnitCommand): void;
  handleStopUnit?(command: StopUnitCommand): void;
  handleCastSkill?(command: CastSkillCommand): void;
}
