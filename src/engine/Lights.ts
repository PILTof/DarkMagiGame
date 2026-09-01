import * as THREE from "three";

export class Lights {
  addTo(scene: THREE.Scene): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(5, 10, 5);
    scene.add(directional);
  }
}
