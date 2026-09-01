import * as THREE from "three";
import { AMBIENT_LIGHT_INTENCITY, DIRECT_LIGHT_INTENCITY } from "../config/gameConfig";

export class Lights {
  addTo(scene: THREE.Scene): void {
    const ambient = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENCITY);
    scene.add(ambient);
1
    const directional = new THREE.DirectionalLight(0xffffff, DIRECT_LIGHT_INTENCITY);
    directional.position.set(5, 10, 5);
    scene.add(directional);
  }
}
