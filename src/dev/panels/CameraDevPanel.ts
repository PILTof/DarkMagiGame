import type GUI from "lil-gui";
import type { Controller } from "lil-gui";
import { CAMERA_FRUSTUM, DEFAULT_AZIMUTH, DEFAULT_DISTANCE, DEFAULT_ELEVATION } from "../../config/gameConfig.ts";
import type { CameraState, IsometricCamera } from "../../engine/IsometricCamera.ts";
import type { DevPanel } from "../DevPanel.ts";

const DEFAULT_STATE: CameraState = {
  azimuth: DEFAULT_AZIMUTH,
  elevation: DEFAULT_ELEVATION,
  distance: DEFAULT_DISTANCE,
  targetX: 0,
  targetY: 0,
  targetZ: 0,
  zoom: 1,
  frustum: CAMERA_FRUSTUM,
};

export class CameraDevPanel implements DevPanel {
  private readonly state: CameraState;
  private readonly camera: IsometricCamera;
  private controllers: Controller[] = [];

  constructor(camera: IsometricCamera) {
    this.camera = camera;
    this.state = { ...camera.getState() };
  }

  mount(folder: GUI): void {
    const rotation = folder.addFolder("Rotation");
    this.controllers.push(
      rotation
        .add(this.state, "azimuth", 0, 360, 1)
        .name("azimuth °")
        .onChange(() => this.apply()),
      rotation
        .add(this.state, "elevation", 5, 85, 0.5)
        .name("elevation °")
        .onChange(() => this.apply()),
      rotation
        .add(this.state, "distance", 5, 50, 0.5)
        .onChange(() => this.apply()),
    );
    rotation.open();

    const target = folder.addFolder("Target");
    this.controllers.push(
      target.add(this.state, "targetX", -30, 30, 0.1).onChange(() => this.apply()),
      target.add(this.state, "targetY", -10, 10, 0.1).onChange(() => this.apply()),
      target.add(this.state, "targetZ", -30, 30, 0.1).onChange(() => this.apply()),
    );

    const projection = folder.addFolder("Projection");
    this.controllers.push(
      projection.add(this.state, "zoom", 0.25, 8, 0.05).onChange(() => this.apply()),
      projection
        .add(this.state, "frustum", 5, 60, 0.5)
        .onChange(() => this.apply()),
    );

    folder.add(
      {
        reset: () => {
          Object.assign(this.state, DEFAULT_STATE);
          this.syncControllers();
          this.apply();
        },
      },
      "reset",
    );

    folder.open();
  }

  dispose(): void {
    for (const controller of this.controllers) {
      controller.destroy();
    }
    this.controllers = [];
  }

  private apply(): void {
    this.camera.applyState(this.state);
  }

  private syncControllers(): void {
    for (const controller of this.controllers) {
      controller.updateDisplay();
    }
  }
}
