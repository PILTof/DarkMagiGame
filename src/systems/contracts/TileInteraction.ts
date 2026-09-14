import type * as THREE from "three";
import type { Tile } from "../../world/tiles/Tile.ts";

export type TilePointerPayload = {
  grid: { q: number; r: number };
  worldPosition: THREE.Vector3;
  tile: Tile;
  pointerEvent: PointerEvent;
};

export type CastRequest = {
  casterId: string;
  skillId: string;
  target: TilePointerPayload;
};

export type TargetPreviewPayload = {
  target: TilePointerPayload | null;
  affectedCells: Array<{ q: number; r: number }>;
  isValid: boolean;
  invalidReason?: string;
};

export type CastResolvedPayload = {
  casterId: string;
  skillId: string;
  targetGrid: { q: number; r: number };
  affectedCells: Array<{ q: number; r: number }>;
  hits: Array<{
    unitId: string;
    damage: number;
    bounds: Array<{
      grid: { q: number; r: number };
      armor: number;
      damage: number;
    }>;
  }>;
};
