import { describe, expect, it, vi } from "vitest";
import type { MoveUnitCommand } from "../../src/commands/MoveUnitCommand.ts";
import type { StopUnitCommand } from "../../src/commands/StopUnitCommand.ts";
import { EventBus } from "../../src/core/EventBus.ts";
import type { GameEventMap } from "../../src/core/GameEvents.ts";
import { HexGrid } from "../../src/world/hex/HexGrid.ts";
import { MovementSystem } from "../../src/systems/MovementSystem.ts";
import * as THREE from "three";

describe("MovementSystem command handlers", () => {
  it("handleMoveUnit emits unit:moved event", () => {
    const eventBus = new EventBus<GameEventMap>();
    const hexGrid = new HexGrid(5, 5);
    
    // Делаем центр проходимым
    for (let r = 0; r < 5; r++) {
      for (let q = 0; q < 5; q++) {
        hexGrid.setBaseWalkable(q, r, true);
      }
    }
    
    const mockPlayer = {
      position: new THREE.Vector3(4, 0, 4),
      setWorldPath: vi.fn(),
    };
    
    const mockEntityManager = {
      getPlayer: vi.fn(() => mockPlayer),
    } as never;

    const mockTileMap = {
      hexGrid,
      worldToGrid: vi.fn(() => ({ q: 2, r: 2 })),
      gridToWorldPosition: vi.fn((q: number, r: number) => new THREE.Vector3(q * 2, 0, r * 2)),
      isWalkable: (q: number, r: number) => hexGrid.isWalkable(q, r),
    } as never;

    const mockPathfinding = {
      canWalkDirect: vi.fn(() => true),
      findPathToward: vi.fn(() => ({ path: [], reachesGoal: true })),
    } as never;

    const system = new MovementSystem(mockEntityManager, mockPathfinding, mockTileMap, hexGrid, eventBus);

    const events: string[] = [];
    eventBus.on("unit:moved", () => events.push("moved"));

    const command: MoveUnitCommand = {
      unitId: "player",
      targetGrid: { q: 3, r: 3 },
      targetWorldX: 6,
      targetWorldZ: 6,
    };

    system.handleMoveUnit(command);

    expect(events).toContain("moved");
    expect(mockPlayer.setWorldPath).toHaveBeenCalled();
  });

  it("handleStopUnit emits unit:stopped event", () => {
    const eventBus = new EventBus<GameEventMap>();
    const hexGrid = new HexGrid(5, 5);
    
    const mockPlayer = {
      position: new THREE.Vector3(4, 0, 4),
      clearPath: vi.fn(),
    };
    
    const mockEntityManager = {
      getPlayer: vi.fn(() => mockPlayer),
    } as never;
    
    const mockTileMap = {
      hexGrid,
      worldToGrid: vi.fn(() => ({ q: 2, r: 2 })),
    } as never;

    const system = new MovementSystem(mockEntityManager, null as never, mockTileMap, hexGrid, eventBus);

    const events: string[] = [];
    eventBus.on("unit:stopped", () => events.push("stopped"));

    const command: StopUnitCommand = {
      unitId: "player",
    };

    system.handleStopUnit(command);

    expect(events).toContain("stopped");
    expect(mockPlayer.clearPath).toHaveBeenCalled();
  });
});
