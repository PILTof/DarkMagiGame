import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import type { GridPos } from "../world/GridCoords";
import type { EntityAssets } from "./EntityAssets";
import { Unit } from "./Unit";

export class Enemy extends Unit {
    
    constructor(id: string, gridPos: GridPos, assets: EntityAssets) {
        const group = Enemy.createMesh(id, assets);
        super(id, gridPos, group);
        
        // Устанавливаем начальное здоровье врага
        this.setHealth(150, 150);
    }

    private static createMesh(id: string, assets: EntityAssets): Group {

        let model = assets.tryClone('enemy');
        if (!model)  {
            model = this.createProceduralMesh();
        } else {
            model.traverse((child) => {
                if (child instanceof Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            })
        }

        model.userData = { type: "entity", entityId: id }

        return model;
    }

    private static createProceduralMesh(): Group {
        const group = new Group();
        const geometry = new BoxGeometry(
            1, 1, 1
        );

        const material = new MeshStandardMaterial({color: "red"});
        const mesh = new Mesh(geometry, material);
        mesh.position.y = 1 / 2;
        mesh.castShadow = true;
        group.add(mesh);
        return group;
    }

}