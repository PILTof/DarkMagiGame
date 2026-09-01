import * as THREE from "three";
import type { IsometricCamera } from "./IsometricCamera.ts";

export class Engine {
  readonly scene: THREE.Scene;
  readonly renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera | null = null;
  private isometricCamera: IsometricCamera | null = null;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    window.addEventListener("resize", () => this.onResize());
  }

  setCamera(isometricCamera: IsometricCamera): void {
    this.isometricCamera = isometricCamera;
    this.camera = isometricCamera.camera;
  }

  render(): void {
    if (this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private onResize(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.isometricCamera?.onResize();
  }
}
