import { describe, it, expect, vi } from "vitest";
import { CommandDispatcher } from "./CommandDispatcher.ts";
import type { MoveUnitCommand } from "./MoveUnitCommand.ts";
import type { StopUnitCommand } from "./StopUnitCommand.ts";
import type { CastSkillCommand } from "./CastSkillCommand.ts";

describe("CommandDispatcher", () => {
  it("dispatches move command to registered handler", () => {
    const dispatcher = new CommandDispatcher();
    const handler = {
      handleMoveUnit: vi.fn(),
      handleStopUnit: vi.fn(),
    };
    
    dispatcher.registerHandler(handler);
    const command: MoveUnitCommand = {
      unitId: "unit1",
      targetGrid: { q: 1, r: 2 },
      targetWorldX: 10,
      targetWorldZ: 20,
    };
    
    dispatcher.dispatchMoveUnit(command);
    expect(handler.handleMoveUnit).toHaveBeenCalledWith(command);
  });

  it("dispatches stop command to registered handler", () => {
    const dispatcher = new CommandDispatcher();
    const handler = {
      handleMoveUnit: vi.fn(),
      handleStopUnit: vi.fn(),
    };
    
    dispatcher.registerHandler(handler);
    const command: StopUnitCommand = { unitId: "unit1" };
    
    dispatcher.dispatchStopUnit(command);
    expect(handler.handleStopUnit).toHaveBeenCalledWith(command);
  });

  it("dispatches cast skill command to registered handler", () => {
    const dispatcher = new CommandDispatcher();
    const handler = {
      handleCastSkill: vi.fn(),
    };
    
    dispatcher.registerHandler(handler);
    const command: CastSkillCommand = {
      casterId: "player1",
      skillId: "arcane_burst",
      targetGrid: { q: 3, r: 4 },
    };
    
    dispatcher.dispatchCastSkill(command);
    expect(handler.handleCastSkill).toHaveBeenCalledWith(command);
  });

  it("ignores commands when no handler registered", () => {
    const dispatcher = new CommandDispatcher();
    const command: MoveUnitCommand = {
      unitId: "unit1",
      targetGrid: { q: 1, r: 2 },
      targetWorldX: 10,
      targetWorldZ: 20,
    };
    
    // Should not throw
    expect(() => dispatcher.dispatchMoveUnit(command)).not.toThrow();
  });
});
