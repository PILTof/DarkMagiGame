import { describe, expect, it } from "vitest";
import { getHexRadiusAffectedCells } from "../../src/skills/HexRadiusTargeting.ts";

describe("getHexRadiusAffectedCells", () => {
  it("returns only in-map cells inside the requested hex radius", () => {
    const map = { width: 3, height: 3 };
    const cells = getHexRadiusAffectedCells(map as never, { q: 1, r: 1 }, 1);

    expect(cells).toHaveLength(7);
    expect(cells).toContainEqual({ q: 1, r: 1 });
    expect(cells).not.toContainEqual({ q: 0, r: 0 });
  });
});
