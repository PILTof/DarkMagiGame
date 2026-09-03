import {
  MathUtils,
  NearestFilter,
  SRGBColorSpace,
  TextureLoader,
  type Object3D,
} from "three";
import { getRandFromArray } from "../../mathutils/GetRandFromArray.ts";
import type { TileAssets } from "./TileAssets.ts";
import type { TileVisualConfig } from "./Tile.ts";
import { Tile } from "./Tile.ts";

export class DirtTile extends Tile {
  private static TEXTURES: Array<string> = ["/assets/images/dirt4.png"];

  readonly type = "stone" as const;
  readonly walkable = true;

  protected async createMesh(assets: TileAssets): Promise<Object3D> {
    const model = assets.tryClone("stone");
    if (model) {
      model.rotation.y = MathUtils.degToRad(
        getRandFromArray([0, 60, 120, 180, 240, 300]),
      );
      return model;
    }

    return this.buildProceduralMesh();
  }

  protected getVisualConfig(): TileVisualConfig {
    const loader = new TextureLoader();
    const texture = loader.load(getRandFromArray(DirtTile.TEXTURES));
    texture.minFilter = NearestFilter;
    texture.magFilter = NearestFilter;
    texture.rotation = MathUtils.degToRad(110);
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
