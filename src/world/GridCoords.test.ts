import { describe, expect, it } from "vitest";
import { GridCoords } from "./GridCoords.ts";

describe("GridCoords", () => {
  it("round-trips axial coordinates through world space", () => {
    const grid = { q: 3, r: -2 };
    expect(GridCoords.worldToGrid(GridCoords.gridToWorld(grid.q, grid.r))).toEqual(grid);
  });

  it("returns six axial neighbours and correct hex distance", () => {
    expect(GridCoords.neighbors(0, 0)).toHaveLength(6);
    expect(GridCoords.distance({ q: 0, r: 0 }, { q: 2, r: -1 })).toBe(2);
  });
});
