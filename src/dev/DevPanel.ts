import type GUI from "lil-gui";

export interface DevPanel {
  mount(folder: GUI): void;
  dispose(): void;
}
