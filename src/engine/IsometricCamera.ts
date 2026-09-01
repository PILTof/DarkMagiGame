import * as THREE from "three";
import { CAMERA_FRUSTUM, DEFAULT_AZIMUTH, DEFAULT_DISTANCE, DEFAULT_ELEVATION } from "../config/gameConfig.ts";

export type CameraState = {
  azimuth: number;
  elevation: number;
  distance: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  zoom: number;
  frustum: number;
};



export class IsometricCamera {
  readonly camera: THREE.OrthographicCamera;
  readonly target = new THREE.Vector3(0, 0, 0);
  private frustumSize = CAMERA_FRUSTUM;

  constructor() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(
      (this.frustumSize * aspect) / -2,
      (this.frustumSize * aspect) / 2,
      this.frustumSize / 2,
      this.frustumSize / -2,
      0.1,
      1000,
    );
    this.applyState({
      azimuth: DEFAULT_AZIMUTH,
      elevation: DEFAULT_ELEVATION,
      distance: DEFAULT_DISTANCE,
      targetX: 0,
      targetY: 0,
      targetZ: 0,
      zoom: 1,
      frustum: CAMERA_FRUSTUM,
    });
  }

  getState(): CameraState {
    const offset = this.camera.position.clone().sub(this.target);
    const distance = offset.length();
    const elevation =
      distance > 0
        ? THREE.MathUtils.radToDeg(Math.asin(offset.y / distance))
        : DEFAULT_ELEVATION;
    const azimuth = THREE.MathUtils.radToDeg(
      Math.atan2(offset.x, offset.z),
    );

    return {
      azimuth,
      elevation,
      distance: distance || DEFAULT_DISTANCE,
      targetX: this.target.x,
      targetY: this.target.y,
      targetZ: this.target.z,
      zoom: this.camera.zoom,
      frustum: this.frustumSize,
    };
  }

  applyState(state: CameraState): void {
    this.target.set(state.targetX, state.targetY, state.targetZ);
    this.camera.zoom = THREE.MathUtils.clamp(state.zoom, 0.25, 8);
    this.frustumSize = state.frustum;

    const azimuth = THREE.MathUtils.degToRad(state.azimuth);
    const elevation = THREE.MathUtils.degToRad(
      THREE.MathUtils.clamp(state.elevation, 1, 89),
    );
    const distance = Math.max(state.distance, 1);
    const horizontal = distance * Math.cos(elevation);

    this.camera.position.set(
      this.target.x + horizontal * Math.sin(azimuth),
      this.target.y + distance * Math.sin(elevation),
      this.target.z + horizontal * Math.cos(azimuth),
    );
    this.camera.lookAt(this.target);
    this.updateProjection();
  }

  onResize(): void {
    this.updateProjection();
  }

  pan(dx: number, dy: number): void {
    this.target.x -= dx;
    this.target.z -= dy;
    this.camera.position.x -= dx;
    this.camera.position.z -= dy;
    this.camera.lookAt(this.target);
  }

  zoom(factor: number): void {
    this.camera.zoom = THREE.MathUtils.clamp(this.camera.zoom * factor, 0.25, 8);
    this.updateProjection();
  }

  private updateProjection(): void {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.left = (this.frustumSize * aspect) / -2;
    this.camera.right = (this.frustumSize * aspect) / 2;
    this.camera.top = this.frustumSize / 2;
    this.camera.bottom = this.frustumSize / -2;
    this.camera.updateProjectionMatrix();
  }
}
