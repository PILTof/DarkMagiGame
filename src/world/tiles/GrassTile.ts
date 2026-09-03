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

export class GrassTile extends Tile {
    private static TEXTURES: Array<string> = [
        "/assets/images/grass4.png",
        "/assets/images/grass4.png",
        "/assets/images/grass4.png",
        "/assets/images/grass5.png",
        "/assets/images/grass6.png",
        "/assets/images/grass6.png",
    ];

    readonly type = "grass" as const;
    readonly walkable = true;

    protected async createMesh(assets: TileAssets): Promise<Object3D> {
        const model = assets.tryClone(
            getRandFromArray([
                "grass",
                "grass2",
                "grass3",
                "grass_empty",
                "grass_empty",
                "grass_empty",
            ]),
        );
        if (model) {
            model.rotation.y = MathUtils.degToRad(270);
            return model;
        }

        return this.buildProceduralMesh();
    }

    protected getVisualConfig(): TileVisualConfig {
        const loader = new TextureLoader();
        const texture = loader.load(getRandFromArray(GrassTile.TEXTURES));
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.rotation = MathUtils.degToRad(
            getRandFromArray([0, 90, 180, 270]),
        );
        texture.colorSpace = SRGBColorSpace;
        texture.center.set(0.5, 0.5);

        return {
            texture: texture,
            roughness: 0.85,
            metalness: 0,
            height: 0.2,
        };
    }
}
