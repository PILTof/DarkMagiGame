import type { CommandHandler } from "./CommandHandler.ts";
import type { CastSkillCommand } from "./contracts/CastSkillCommand.ts";
import type { MoveUnitCommand } from "./contracts/MoveUnitCommand.ts";
import type { StopUnitCommand } from "./contracts/StopUnitCommand.ts";

/**
 * Command dispatcher — маршрутизирует команды к соответствующим handler'ам.
 * Отделяет user intent от domain logic.
 */
export class CommandDispatcher {
  private handlers: CommandHandler[] = [];

  registerHandler(handler: CommandHandler): void {
    this.handlers.push(handler);
  }

  dispatchMoveUnit(command: MoveUnitCommand): void {
    for (const handler of this.handlers) {
      handler.handleMoveUnit?.(command);
    }
  }

  dispatchStopUnit(command: StopUnitCommand): void {
    for (const handler of this.handlers) {
      handler.handleStopUnit?.(command);
    }
  }

  dispatchCastSkill(command: CastSkillCommand): void {
    for (const handler of this.handlers) {
      handler.handleCastSkill?.(command);
    }
  }
}
