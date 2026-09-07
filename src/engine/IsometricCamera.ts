import * as THREE from "three";
import { CAMERA_FRUSTUM, CAMERA_OFFSET_X, CAMERA_OFFSET_Y, CAMERA_OFFSET_Z, CAMERA_SMOOTH, DEFAULT_AZIMUTH, DEFAULT_DISTANCE, DEFAULT_ELEVATION } from "../config/gameConfig.ts";
import type { Entity } from "../entities/Entity.ts";

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
  
  // Статический параметр: за кем следит камера
  private followTarget: Entity | null = null;
  // Последняя известная позиция цели для расчета смещения
  private lastTargetPosition = new THREE.Vector3();

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

  /**
   * Устанавливает объект, за которым будет следовать камера
   * @param entity - Сущность для отслеживания (например, игрок)
   */
  setFollowTarget(entity: Entity | null): void {
    this.followTarget = entity;
    if (entity) {
      // Устанавливаем начальную позицию камеры относительно персонажа
      const playerPos = entity.mesh.position;
      const newTargetX = playerPos.x + CAMERA_OFFSET_X;
      const newTargetY = playerPos.y + CAMERA_OFFSET_Y;
      const newTargetZ = playerPos.z + CAMERA_OFFSET_Z;
      
      // Вычисляем смещение от текущей позиции target к новой
      const deltaX = newTargetX - this.target.x;
      const deltaY = newTargetY - this.target.y;
      const deltaZ = newTargetZ - this.target.z;
      
      // Сдвигаем target и камеру на это смещение
      this.target.set(newTargetX, newTargetY, newTargetZ);
      this.camera.position.x += deltaX;
      this.camera.position.y += deltaY;
      this.camera.position.z += deltaZ;
      this.camera.lookAt(this.target);
      
      // Запоминаем начальную позицию цели
      this.lastTargetPosition.copy(playerPos);
    }
  }

  /**
   * Возвращает текущий объект слежения
   */
  getFollowTarget(): Entity | null {
    return this.followTarget;
  }

  /**
   * Обновляет позицию камеры для следования за объектом
   */
  update(): void {
    if (!this.followTarget) return;

    // Вычисляем смещение цели с момента последнего обновления
    const currentTargetPos = this.followTarget.mesh.position;
    const delta = new THREE.Vector3(
      currentTargetPos.x - this.lastTargetPosition.x,
      currentTargetPos.y - this.lastTargetPosition.y,
      currentTargetPos.z - this.lastTargetPosition.z
    );

    // Применяем плавность к движению (lerp для плавного следования)
    const smoothing = CAMERA_SMOOTH;
    const smoothedDelta = delta.multiplyScalar(smoothing);

    // Сдвигаем и target, и позицию камеры на одинаковое смещение
    // Это сохраняет относительную позицию камеры
    this.target.add(smoothedDelta);
    this.camera.position.add(smoothedDelta);
    this.camera.lookAt(this.target);

    // Обновляем последнюю позицию с учетом примененного смещения
    this.lastTargetPosition.add(smoothedDelta);
  }

}
