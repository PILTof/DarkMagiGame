import { env } from "../config/env.ts";
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
import { PathfindingService } from "../world/PathfindingService.ts";
import { TileMap } from "../world/TileMap.ts";
import { Clock } from "./Clock.ts";
import { EventBus } from "./EventBus.ts";

export class Game {
  private readonly clock = new Clock();
  private readonly eventBus = new EventBus();
  private readonly engine: Engine;
  private readonly systems: System[] = [];
  private readonly camera: IsometricCamera;

  constructor(container: HTMLElement) {
    this.engine = new Engine(container);

    this.camera = new IsometricCamera();
    this.engine.setCamera(this.camera);
    new PointerHandler(this.camera);

    new Lights().addTo(this.engine.scene);

    const tileMap = new TileMap(this.engine.scene);
    tileMap.build();

    const entityManager = new EntityManager();
    const pathfinding = new PathfindingService(tileMap);

    const spawn = tileMap.findSpawnTile();
    const player = createPlayer(spawn);
    entityManager.add(player, this.engine.scene);
    const spawnPos = tileMap.gridToWorldPosition(spawn.q, spawn.r);
    player.mesh.position.copy(spawnPos);

    this.systems.push(
      new InputSystem(this.engine, this.camera, tileMap, this.eventBus),
      new SelectionSystem(this.eventBus),
      new MovementSystem(entityManager, pathfinding, tileMap, this.eventBus),
      new AnimationSystem(entityManager),
    );

    void new AssetLoader();
    if (env.debug) {
      void this.initDevTools();
    }
  }

  start(): void {
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

  private async initDevTools(): Promise<void> {
    const { initDevTools } = await import("../dev/index.ts");
    await initDevTools(this.camera);
  }
}
