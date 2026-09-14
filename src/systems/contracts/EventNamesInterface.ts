export const PlayerCombat = {
  click_target: "player:hit-target",
  target_requested: "player:target-requested",
  cast_spell: "player:cast-skill",
  cast_rejected: "player:cast-rejected",
  cast_resolved: "player:cast-resolved",
  dodge: "player:dodge",
} as const;

export const PlayerMovement = {
  move_to: "player:move-to",
  move_stop: "player:move-stop",
} as const;

export const TileInteraction = {
  pointer_move: "tile:pointer-move",
  pointer_click: "tile:pointer-click",
  hover_changed: "tile:hover-changed",
  target_preview_changed: "tile:target-preview-changed",
  targeting_changed: "tile:targeting-changed",
} as const;

export const Effects = {
  tile_click: "effects:tile-click",
  aoe_impact: "effects:aoe-impact",
} as const;
