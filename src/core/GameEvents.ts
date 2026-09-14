import type { Unit } from "../entities/Unit.ts";
import type { HitTarget } from "../systems/DTOs/HitTarget.ts";
import type {
  CastRequest,
  CastResolvedPayload,
  TargetPreviewPayload,
  TilePointerPayload,
} from "../systems/contracts/TileInteraction.ts";

export type MoveToPayload = { x: number; z: number };
export type TargetRequestedPayload = {
  event: PointerEvent;
  target: TilePointerPayload;
};
export type CastRejectedPayload = {
  reason: string;
  request?: CastRequest;
  target?: TilePointerPayload;
};

export type GameEventMap = {
  "player:hit-target": { sniper: Unit; target: HitTarget };
  "player:target-requested": TargetRequestedPayload;
  "player:cast-skill": CastRequest;
  "player:cast-rejected": CastRejectedPayload;
  "player:cast-resolved": CastResolvedPayload;
  "player:dodge": undefined;
  "player:move-to": MoveToPayload;
  "player:move-stop": Record<string, never>;
  "tile:pointer-move": TilePointerPayload | null;
  "tile:pointer-click": TilePointerPayload;
  "tile:hover-changed": TilePointerPayload | null;
  "tile:target-preview-changed": TargetPreviewPayload;
  "tile:targeting-changed": { active: boolean };
  "effects:tile-click": TargetPreviewPayload;
  "effects:aoe-impact": CastResolvedPayload;
};
