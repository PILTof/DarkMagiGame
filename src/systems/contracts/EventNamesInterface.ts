export const PlayerCombat = {
    click_target: "player:hit_targer",
    target_requested: "player:target-requested",
    cast_spell: "player:cast_spell",
    cast_rejected: "player:cast-rejected",
    cast_resolved: "player:cast-resolved",
    dodge: "player:dodge",
};

export const PlayerMovement = {
    move_to: "player:move-to",
    move_stop: "player:move-stop",
};

export const TileInteraction = {
    pointer_move: "tile:pointer-move",
    pointer_click: "tile:pointer-click",
    hover_changed: "tile:hover-changed",
    target_preview_changed: "tile:target-preview-changed",
    targeting_changed: "tile:targeting-changed",
};

export const Effects = {
    projectile_hit: "combat:projectile-hit",
    tile_click: "effects:tile-click",
    aoe_impact: "effects:aoe-impact",
};