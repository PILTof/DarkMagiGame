import {
  MathUtils,
  NearestFilter,
  SRGBColorSpace,
  TextureLoader,
  type Object3D,
} from "three";
import { getRandFromArray } from "../../mathutils/GetRandFromArray.ts";
import type { TileVisualConfig } from "./Tile.ts";
import { Tile } from "./Tile.ts";
import type { TileAssets } from "./TileAssets.ts";

export class WaterTile extends Tile {
    private static TEXTURES: Array<string> = [
        "/assets/images/water.png",
        "/assets/images/water2.png",
    ];

    readonly type = "water" as const;
    readonly walkable = false;

    protected async createMesh(assets: TileAssets): Promise<Object3D> {
        const model = assets.tryClone("water");
        if (model) {
            model.rotation.y = MathUtils.degToRad(270);
            return model;
        }

        return this.buildProceduralMesh();
    }

    protected getVisualConfig(): TileVisualConfig {
        const loader = new TextureLoader();
        const texture = loader.load(getRandFromArray(WaterTile.TEXTURES));
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.rotation = MathUtils.degToRad(
            getRandFromArray([0, 90, 180, 270]),
        );
        texture.colorSpace = SRGBColorSpace;
        texture.center.set(0.5, 0.5);

        return {
            roughness: 0.2,
            metalness: 0.1,
            height: 0.15,
            texture: texture,
        };
    }
}
