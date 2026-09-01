import type GUI from "lil-gui";
import type { Controller } from "lil-gui";
import { AMBIENT_LIGHT_INTENCITY, DIRECT_LIGHT_INTENCITY } from "../../config/gameConfig";
import type { Lights, LightsState } from "../../engine/Lights";
import type { DevPanel } from "../DevPanel";

export class LightDevPanel implements DevPanel {
    private constrollers: Controller[] = [];
    private readonly state: LightsState;
    private readonly lights: Lights;

    constructor(lights: Lights) {
        this.lights = lights;
        this.state = lights.getState();
    }

    mount(folder: GUI): void {
        this.constrollers.push(
            folder
                .add(this.state, "abmientIntecity", 0, AMBIENT_LIGHT_INTENCITY, 0.1)
                .name("ambient intencity")
                .onChange(() => this.apply()),
            folder
                .add(this.state, 'directIntencity', 0, DIRECT_LIGHT_INTENCITY, 0.1)
                .name('direct intencity')
                .onChange(() => this.apply())
        );

        folder.open();
    }

    dispose(): void {
        for (const controller of this.constrollers) {
            controller.destroy();
        }

        this.constrollers = [];
    }

    private apply(): void {
        this.lights.applyState(this.state);
    }
}
