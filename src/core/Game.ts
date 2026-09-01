import { DEFAULT_MAP_PATH } from "../config/gameConfig.ts";
import { env } from "../config/env.ts";
import { DevTools } from "../dev/DevTools.ts";
import { AssetLoader } from "../engine/AssetLoader.ts";
import { Engine } from "../engine/Engine.ts";
import { IsometricCamera } from "../engine/IsometricCamera.ts";
import { Lights } from "../engine/Lights.ts";
import { EntityManager } from "../entities/EntityManager.ts";
import { createPlayer } from "../entities/Player.ts";
import { PointerHandler } from "../input/PointerHandler.ts";
import { AnimationSystem } from "../systems/AnimationSystem.ts";
import { InputSystem } from "../systems/InputSystem.ts";
import { MovementSystem } from "../systems/MovementSystem.ts";
import { SelectionSystem } from "../systems/SelectionSystem.ts";
import type { System } from "../systems/System.ts";
import { loadMap } from "../world/map/index.ts";
import { PathfindingService } from "../world/PathfindingService.ts";
import { TileMap } from "../world/TileMap.ts";
import { Clock } from "./Clock.ts";
import { EventBus } from "./EventBus.ts";

export class Game {
  private readonly clock = new Clock();
  private readonly eventBus = new EventBus();
  private readonly engine: Engine;
  private readonly camera: IsometricCamera;
  private readonly lights: Lights;
  private tileMap: TileMap | null = null;
  private systems: System[] = [];

  constructor(container: HTMLElement) {
    this.engine = new Engine(container);

    this.camera = new IsometricCamera();
    this.engine.setCamera(this.camera);
    new PointerHandler(this.camera);

    this.lights = new Lights();
    this.lights.addTo(this.engine.scene);
  }

  async load(mapPath: string = DEFAULT_MAP_PATH): Promise<void> {
    const mapData = await loadMap(mapPath);

    this.tileMap = new TileMap(this.engine.scene);
    this.tileMap.buildFromMap(mapData);

    const entityManager = new EntityManager();
    const pathfinding = new PathfindingService(this.tileMap);

    const spawn = this.tileMap.getPlayerSpawn();
    const player = createPlayer(spawn);
    entityManager.add(player, this.engine.scene);
    player.mesh.position.copy(this.tileMap.gridToWorldPosition(spawn.q, spawn.r));

    this.systems = [
      new InputSystem(this.engine, this.camera, this.tileMap, this.eventBus),
      new SelectionSystem(this.eventBus),
      new MovementSystem(entityManager, pathfinding, this.tileMap, this.eventBus),
      new AnimationSystem(entityManager),
    ];

    void new AssetLoader();

    if (env.debug) {
      this.initDevTools();
    }
  }

  start(): void {
    if (!this.tileMap) {
      throw new Error("Call game.load() before game.start()");
    }

    const loop = (): void => {
      requestAnimationFrame(loop);
      const dt = this.clock.getDelta();
      for (const system of this.systems) {
        system.update(dt);
      }
      this.engine.render();
    };
    loop();
  }

  private initDevTools(): void {
    const devTools = new DevTools();
    devTools.initCamera(this.camera);
    devTools.initLights(this.lights);
  }
}
