import * as THREE from "three";
import { CAMERA_FRUSTUM } from "../config/gameConfig.ts";

export class IsometricCamera {
  readonly camera: THREE.OrthographicCamera;

  constructor() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(
      (CAMERA_FRUSTUM * aspect) / -2,
      (CAMERA_FRUSTUM * aspect) / 2,
      CAMERA_FRUSTUM / 2,
      CAMERA_FRUSTUM / -2,
      0.1,
      1000,
    );
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);
  }

  onResize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.left = (CAMERA_FRUSTUM * aspect) / -2;
    this.camera.right = (CAMERA_FRUSTUM * aspect) / 2;
    this.camera.top = CAMERA_FRUSTUM / 2;
    this.camera.bottom = CAMERA_FRUSTUM / -2;
    this.camera.updateProjectionMatrix();
  }

  pan(dx: number, dy: number): void {
    this.camera.position.x -= dx;
    this.camera.position.z -= dy;
    this.camera.lookAt(
      this.camera.position.x - 10,
      0,
      this.camera.position.z - 10,
    );
  }

  zoom(factor: number): void {
    this.camera.zoom = THREE.MathUtils.clamp(this.camera.zoom * factor, 0.5, 4);
    this.camera.updateProjectionMatrix();
  }
}
