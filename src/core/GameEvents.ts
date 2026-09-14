import type { Unit } from "../entities/Unit.ts";
import type { HitTarget } from "../systems/DTOs/HitTarget.ts";
import type {
  CastRequest,
  CastResolvedPayload,
  TargetPreviewPayload,
  TilePointerPayload,
} from "../systems/contracts/TileInteraction.ts";
import type { GridPos } from "../world/GridCoords.ts";

export type TargetRequestedPayload = {
  event: PointerEvent;
  target: TilePointerPayload;
};
export type CastRejectedPayload = {
  reason: string;
  request?: CastRequest;
  target?: TilePointerPayload;
};

// Domain events (прошлое, facts)
export type UnitMovedEvent = {
  unitId: string;
  fromGrid: GridPos;
  toGrid: GridPos;
};

export type UnitStoppedEvent = {
  unitId: string;
  atGrid: GridPos;
};

export type UnitReachedWaypointEvent = {
  unitId: string;
  waypointGrid: GridPos;
};

export type GameEventMap = {
  "player:hit-target": { sniper: Unit; target: HitTarget };
  "player:target-requested": TargetRequestedPayload;
  "player:cast-skill": CastRequest;
  "player:cast-rejected": CastRejectedPayload;
  "player:cast-resolved": CastResolvedPayload;
  "player:dodge": undefined;
  "tile:pointer-move": TilePointerPayload | null;
  "tile:pointer-click": TilePointerPayload;
  "tile:hover-changed": TilePointerPayload | null;
  "tile:target-preview-changed": TargetPreviewPayload;
  "tile:targeting-changed": { active: boolean };
  "effects:tile-click": TargetPreviewPayload;
  "effects:aoe-impact": CastResolvedPayload;
  
  // Domain events
  "unit:moved": UnitMovedEvent;
  "unit:stopped": UnitStoppedEvent;
  "unit:reached-waypoint": UnitReachedWaypointEvent;
};
