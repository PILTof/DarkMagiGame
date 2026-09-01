import GUI from "lil-gui";
import type { MeshToonMaterial } from "three";
import type { IsometricCamera } from "../engine/IsometricCamera.ts";
import type { Lights } from "../engine/Lights.ts";
import type { DevPanel } from "./DevPanel.ts";
import { CameraDevPanel } from "./panels/CameraDevPanel.ts";
import { LightDevPanel } from "./panels/LightDevPangel.ts";
import { WireFrameDevPanel } from "./panels/WireframeDevPanel.ts";

export class DevTools {
    private readonly gui: GUI;
    private readonly panels: DevPanel[] = [];
    private static instance: DevTools;

    constructor() {
        this.gui = new GUI({ title: "Dev Tools" });
        this.gui.domElement.style.marginTop = "8px";
    }

    public static getInstance(): DevTools
    {
        if (DevTools.instance !== undefined) {
            return DevTools.instance;
        }
        DevTools.instance = new DevTools();
        return DevTools.instance;
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

    initWireframe(mesh: MeshToonMaterial) {
        const wfPanel = new WireFrameDevPanel(mesh);
        const wfFolder = this.gui.addFolder('Wireframe');
        wfPanel.mount(wfFolder);
        this.panels.push(wfPanel);
    }

    dispose(): void {
        for (const panel of this.panels) {
            panel.dispose();
        }
        this.gui.destroy();
    }
}
