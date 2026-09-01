import GUI from "lil-gui";
import type { IsometricCamera } from "../engine/IsometricCamera.ts";
import type { Lights } from "../engine/Lights.ts";
import type { DevPanel } from "./DevPanel.ts";
import { CameraDevPanel } from "./panels/CameraDevPanel.ts";
import { LightDevPanel } from "./panels/LightDevPangel.ts";

export class DevTools {
    private readonly gui: GUI;
    private readonly panels: DevPanel[] = [];

    constructor() {
        this.gui = new GUI({ title: "Dev Tools" });
        this.gui.domElement.style.marginTop = "8px";
    }

    initCamera(camera: IsometricCamera) {
        const cameraPanel = new CameraDevPanel(camera);
        const cameraFolder = this.gui.addFolder("Camera");
        cameraPanel.mount(cameraFolder);
        this.panels.push(cameraPanel);
    }

    initLights(lights: Lights) {
        const lightPanel = new LightDevPanel(lights);
        const lightFolder = this.gui.addFolder("Lights");
        lightPanel.mount(lightFolder);
        this.panels.push(lightPanel);
    }

    dispose(): void {
        for (const panel of this.panels) {
            panel.dispose();
        }
        this.gui.destroy();
    }
}
