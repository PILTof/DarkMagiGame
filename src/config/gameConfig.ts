// world
import { env } from "./env.ts";

export const TILE_SIZE = 1;
export const MAP_WIDTH = 12;
export const MAP_HEIGHT = 12;
export const CAMERA_FRUSTUM = 20;
export const UNIT_SPEED = env.unitSpeed;
export const DEFAULT_MAP_PATH = "/maps/level1.json";
export const AMBIENT_LIGHT_INTENCITY = 2;
export const DIRECT_LIGHT_INTENCITY = 1;

// camera
export const DEFAULT_AZIMUTH = 270;
export const DEFAULT_ELEVATION = 38;
export const DEFAULT_DISTANCE = Math.sqrt(300);