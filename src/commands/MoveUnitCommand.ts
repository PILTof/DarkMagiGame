import type { GridPos } from "../world/GridCoords.ts";

export type MoveUnitCommand = {
  readonly unitId: string;
  readonly targetGrid: GridPos;
  readonly targetWorldX: number;
  readonly targetWorldZ: number;
};
