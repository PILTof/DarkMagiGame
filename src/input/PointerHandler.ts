import type { IsometricCamera } from "../engine/IsometricCamera.ts";

export class PointerHandler {
  private readonly camera: IsometricCamera;

  constructor(camera: IsometricCamera) {
    this.camera = camera;
    window.addEventListener("wheel", (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      this.camera.zoom(factor);
    });
  }
}
