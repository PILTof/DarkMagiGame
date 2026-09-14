import type { IsometricCamera } from "../engine/IsometricCamera.ts";

export class PointerHandler {
  private readonly camera: IsometricCamera;
  private readonly onWheel = (event: WheelEvent): void => {
    this.camera.zoom(event.deltaY > 0 ? 0.9 : 1.1);
  };

  constructor(camera: IsometricCamera) {
    this.camera = camera;
    window.addEventListener("wheel", this.onWheel);
  }

  dispose(): void {
    window.removeEventListener("wheel", this.onWheel);
  }
}
