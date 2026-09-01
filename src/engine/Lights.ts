import * as THREE from "three";
import {
    AMBIENT_LIGHT_INTENCITY,
    DIRECT_LIGHT_INTENCITY,
} from "../config/gameConfig";

export type LightsState = {
    abmientIntecity: number;
    ambientColor: number;

    directIntencity: number;
    directColor: number;
};

export class Lights {

    private ambient: THREE.AmbientLight;
    private direct: THREE.DirectionalLight;

    constructor()
    {
        this.ambient = new THREE.AmbientLight(
            0xffffff,
            AMBIENT_LIGHT_INTENCITY,
        );

        this.direct =  new THREE.DirectionalLight(
            0xffffff,
            DIRECT_LIGHT_INTENCITY,
        );
    }

    addTo(scene: THREE.Scene): void {
        scene.add(this.ambient);
        this.direct.position.set(5, 10, 5);
        scene.add(this.direct);
    }

    getState(): LightsState {
        return {
            abmientIntecity: AMBIENT_LIGHT_INTENCITY,
            ambientColor: 0xffffff,

            directColor: 0xffffff,
            directIntencity: DIRECT_LIGHT_INTENCITY,
        };
    }

    applyState(state: LightsState): void {
        this.direct.intensity = state.abmientIntecity;
        this.ambient.intensity = state.directIntencity;
    }
}
