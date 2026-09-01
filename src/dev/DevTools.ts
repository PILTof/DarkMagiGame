import GUI from "lil-gui";
import type { IsometricCamera } from "../engine/IsometricCamera.ts";
import type { DevPanel } from "./DevPanel.ts";
import { CameraDevPanel } from "./panels/CameraDevPanel.ts";

export class DevTools {
  private readonly gui: GUI;
  private readonly panels: DevPanel[] = [];
  private readonly camera: IsometricCamera;

  constructor(camera: IsometricCamera) {
    this.camera = camera;
    this.gui = new GUI({ title: "Dev Tools" });
    this.gui.domElement.style.marginTop = "8px";

    const cameraPanel = new CameraDevPanel(this.camera);
    const cameraFolder = this.gui.addFolder("Camera");
    cameraPanel.mount(cameraFolder);
    this.panels.push(cameraPanel);
  }

  dispose(): void {
    for (const panel of this.panels) {
      panel.dispose();
    }
    this.gui.destroy();
  }
}
