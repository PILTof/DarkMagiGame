import type GUI from "lil-gui";
import type { Controller } from "lil-gui";
import * as THREE from "three";
import type { DevPanel } from "../DevPanel";

type WireFrameState = {
    color: Number|string,
    visible: boolean;
}

export class WireFrameDevPanel implements DevPanel {
    private constrollers: Controller[] = [];

    private state: WireFrameState = {
        color: "black",
        visible: true,
    };

    private readonly material: THREE.MeshToonMaterial;

    constructor(material: THREE.MeshToonMaterial) {
        this.material = material;
    }

    mount(folder: GUI): void {
        this.constrollers.push(
            folder
                .add(this.state, 'color')
                .name('Color')
                .onChange(() => this.apply()),
            folder
                .add(this.state, 'visible')
                .name('Visible')
                .onChange(() => this.apply())
        )
        folder.open();
    }

    dispose(): void {
        for (const controller of this.constrollers) {
            controller.destroy();
        }
        this.constrollers = [];
    }

    private apply(): void {
        this.material.visible = this.state.visible;
        this.material.color = new THREE.Color(this.state.color);
    }
}
