import * as THREE from "three";
import { TILE_SIZE } from "../../config/gameConfig.ts";
import { Tile } from "./Tile.ts";

const HEIGHT = 0.2;
const SEGMENTS = 6;

export class GrassTile extends Tile {
    readonly type = "grass" as const;
    readonly walkable = true;

    private static geometry: THREE.CylinderGeometry | null = null;

    private readonly color = 0x4a7c59;
    private readonly roughness = 0.85;
    private readonly metalness = 0;
    private readonly texture: THREE.Texture | null = null;


    protected buildMesh(): THREE.Mesh {
        const geometry = GrassTile.getGeometry();
        const material = this.createMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = -HEIGHT / 2;
        return mesh;
    }

    private static getGeometry(): THREE.CylinderGeometry {
        if (!GrassTile.geometry) {
            GrassTile.geometry = new THREE.CylinderGeometry(
                TILE_SIZE,
                TILE_SIZE,
                HEIGHT,
                SEGMENTS,
            );
        }
        return GrassTile.geometry;
    }

    private createMaterial(): THREE.MeshStandardMaterial {
        return new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: this.roughness,
            metalness: this.metalness,
        });
    }
}
