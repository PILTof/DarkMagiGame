import type { MapData } from "./MapData.ts";

export async function loadMap(path: string): Promise<MapData> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load map "${path}": ${response.status}`);
  }

  const data: unknown = await response.json();
  validateMapData(data);
  return data;
}

function validateMapData(data: unknown): asserts data is MapData {
  if (!data || typeof data !== "object") {
    throw new Error("Map data must be an object");
  }

  const map = data as MapData;

  if (!Number.isInteger(map.width) || map.width < 1) {
    throw new Error("Map width must be a positive integer");
  }
  if (!Number.isInteger(map.height) || map.height < 1) {
    throw new Error("Map height must be a positive integer");
  }
  if (!map.terrain?.legend || typeof map.terrain.legend !== "object") {
    throw new Error("Map terrain.legend is required");
  }
  if (!Array.isArray(map.terrain.rows)) {
    throw new Error("Map terrain.rows must be an array");
  }
  if (map.terrain.rows.length !== map.height) {
    throw new Error("terrain.rows length must match map height");
  }

  for (const [rowIndex, row] of map.terrain.rows.entries()) {
    if (typeof row !== "string" || row.length !== map.width) {
      throw new Error(`terrain row ${rowIndex} must be a string of length ${map.width}`);
    }
    for (const char of row) {
      if (!(char in map.terrain.legend)) {
        throw new Error(`Unknown terrain char "${char}" in row ${rowIndex}`);
      }
    }
  }

  if (!Array.isArray(map.objects)) {
    throw new Error("Map objects must be an array");
  }
  if (!Array.isArray(map.spawns)) {
    throw new Error("Map spawns must be an array");
  }

  for (const object of map.objects) {
    assertInBounds(object.q, object.r, map.width, map.height, "object");
  }

  for (const spawn of map.spawns) {
    assertInBounds(spawn.q, spawn.r, map.width, map.height, "spawn");
  }
}

function assertInBounds(
  q: number,
  r: number,
  width: number,
  height: number,
  label: string,
): void {
  if (!Number.isInteger(q) || !Number.isInteger(r)) {
    throw new Error(`${label} coordinates must be integers`);
  }
  if (q < 0 || r < 0 || q >= width || r >= height) {
    throw new Error(`${label} (${q}, ${r}) is out of map bounds`);
  }
}
