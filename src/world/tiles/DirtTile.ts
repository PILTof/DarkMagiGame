import { MathUtils, NearestFilter, SRGBColorSpace, TextureLoader } from "three";
import { getRandFromArray } from "../../mathutils/GetRandFromArray.ts";
import type { TileVisualConfig } from "./Tile.ts";
import { Tile } from "./Tile.ts";

export class DirtTile extends Tile {
    private static TEXTURES: Array<string> = [
        "/assets/images/dirt.png",
        "/assets/images/dirt2.png",
        "/assets/images/dirt3.png",
        "/assets/images/dirt3.png",
        "/assets/images/dirt3.png",
    ];
    readonly type = "stone" as const;
    readonly walkable = true;

    protected getVisualConfig(): TileVisualConfig {
        const loader = new TextureLoader();
        const texture = loader.load(getRandFromArray(DirtTile.TEXTURES));
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.rotation = MathUtils.degToRad(
            getRandFromArray([0, 90, 180, 270]),
        );
        texture.colorSpace = SRGBColorSpace;
        texture.center.set(0.5, 0.5);

        return {
            texture: texture,
            roughness: 0.7,
            metalness: 0.05,
            height: 0.22,
        };
    }
}
