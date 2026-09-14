import type { Object3D } from "three";
import { Tile, type TileVisualConfig } from "./Tile";
import type { TileAssets } from "./TileAssets";

export class UnitBoundsTile extends Tile {
    readonly type: string = "bound";
    readonly walkable: boolean = true;

    protected async createMesh(_assets: TileAssets): Promise<Object3D> {
        return this.buildProceduralMesh();
    }

    protected getVisualConfig(): TileVisualConfig {
        return {
            roughness: 0.85,
            metalness: 0,
            height: 0.2,
            color: 0x00ffff
        };
    }
}
