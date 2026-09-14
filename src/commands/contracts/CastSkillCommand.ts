import type { GridPos } from "../../world/GridCoords.ts";

export type CastSkillCommand = {
  readonly casterId: string;
  readonly skillId: string;
  readonly targetGrid: GridPos;
};
