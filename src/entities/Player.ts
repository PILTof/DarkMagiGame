import * as THREE from "three";
import { UNIT_SPEED } from "../config/gameConfig.ts";
import type { GridPos } from "../world/GridCoords.ts";
import { Unit } from "./Unit.ts";

export const PLAYER_ID = "player";

const PLAYER_SIZE = 0.45;
const PLAYER_HEIGHT = 0.5;

export function createPlayer(spawn: GridPos): Unit {
  const group = new THREE.Group();

  const geometry = new THREE.BoxGeometry(
    PLAYER_SIZE,
    PLAYER_HEIGHT,
    PLAYER_SIZE,
  );
  const material = new THREE.MeshStandardMaterial({ color: 0xe8c547 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = PLAYER_HEIGHT / 2;
  mesh.castShadow = true;
  group.add(mesh);

  group.userData = { type: "player", entityId: PLAYER_ID };

  const player = new Unit(PLAYER_ID, spawn, group);
  player.speed = UNIT_SPEED;
  return player;
}
