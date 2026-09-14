import { describe, expect, it } from "vitest";
import { HexGrid } from "./HexGrid.ts";

describe("HexGrid", () => {
  it("respects bounds and walkability", () => {
    const grid = new HexGrid(3, 3);
    grid.setBaseWalkable(1, 1, true);
    grid.blockCell(1, 1);

    expect(grid.isWalkable(1, 1)).toBe(false);
    expect(grid.isWalkable(0, 0)).toBe(false); // not set = unwalkable
    expect(grid.isWalkable(-1, 0)).toBe(false); // out of bounds
    expect(grid.getCellWalkability(1, 1)).toBe("blocked");
  });

  it("registers and retrieves spawn points", () => {
    const grid = new HexGrid(5, 5);
    grid.addSpawn("player", "hero", 2, 2);
    grid.addSpawn("enemy", "goblin", 3, 3);

    expect(grid.getSpawns("player")).toHaveLength(1);
    expect(grid.getSpawns()).toHaveLength(2);
  });

  it("provides fallback spawn when player spawn is blocked", () => {
    const grid = new HexGrid(3, 3);
    grid.addSpawn("player", "hero", 1, 1);
    grid.setBaseWalkable(1, 1, true);
    grid.blockCell(1, 1);
    grid.setBaseWalkable(0, 0, true);

    const spawn = grid.getPlayerSpawn();
    expect(spawn).toEqual({ q: 0, r: 0 });
  });
});
