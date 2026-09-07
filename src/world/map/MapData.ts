import type { TileType } from "../tiles/Tile.ts";

export type MapObjectType = "tree" | "rock";

export type MapObject = {
  type: MapObjectType;
  q: number;
  r: number;
};

export type MapSpawn = {
  type: string;
  q: number;
  r: number;
  name: string;
};

export type MapData = {
  width: number;
  height: number;
  terrain: {
    legend: Record<string, TileType>;
    rows: string[];
  };
  objects: MapObject[];
  spawns: MapSpawn[];
};
