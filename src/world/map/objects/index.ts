import type { GridPos } from "../../GridCoords.ts";
import type { MapObjectType } from "../MapData.ts";
import { MapObjectBase } from "./MapObjectBase.ts";
import { RockObject } from "./RockObject.ts";
import { TreeObject } from "./TreeObject.ts";

export function createMapObject(
  type: MapObjectType,
  pos: GridPos,
): MapObjectBase {
  switch (type) {
    case "tree":
      return new TreeObject(pos);
    case "rock":
      return new RockObject(pos);
  }
}

export { MapObjectAssets } from "./MapObjectAssets.ts";
export { MapObjectBase } from "./MapObjectBase.ts";
export { RockObject } from "./RockObject.ts";
export { TreeObject } from "./TreeObject.ts";
