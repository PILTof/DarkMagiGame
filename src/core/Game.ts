import { env } from "../config/env.ts";
import { DEFAULT_MAP_PATH } from "../config/gameConfig.ts";
import { DevTools } from "../dev/DevTools.ts";
import { AssetLoader } from "../engine/AssetLoader.ts";
import { Engine } from "../engine/Engine.ts";
import { IsometricCamera } from "../engine/IsometricCamera.ts";
import { Lights } from "../engine/Lights.ts";
import { Enemy } from "../entities/Enemy.ts";
import { EntityAssets } from "../entities/EntityAssets.ts";
import { EntityManager } from "../entities/EntityManager.ts";
import { Player } from "../entities/Player.ts";
import { SpriteAssets } from "../entities/SpriteAssets.ts";
import { PointerHandler } from "../input/PointerHandler.ts";
import { AnimationSystem } from "../systems/AnimationSystem.ts";
import { BoundsSystem } from "../systems/BoundsSystem.ts";
import { CombatSystem } from "../systems/Combat/CombatSystem.ts";
import { InputSystem } from "../systems/InputSystem.ts";
import { MovementSystem } from "../systems/MovementSystem.ts";
import { ProjectileSystem } from "../systems/ProjectileSystem.ts";
import { SelectionSystem } from "../systems/SelectionSystem.ts";
import type { System } from "../systems/System.ts";
import { MapLoader } from "../world/map/index.ts";
import { MapObjectAssets } from "../world/map/objects/index.ts";
import { PathfindingService } from "../world/PathfindingService.ts";
import { TileMap } from "../world/TileMap.ts";
import { TileAssets } from "../world/tiles/TileAssets.ts";
import { Clock } from "./Clock.ts";
import { EventBus } from "./EventBus.ts";

export class Game {
  private readonly clock = new Clock();
  private readonly eventBus = EventBus.getInstance();
  private readonly engine: Engine;
  private readonly camera: IsometricCamera;
  private readonly lights: Lights;
  private tileMap: TileMap | null = null;
  private systems: System[] = [];
  private readonly mapLoader = new MapLoader();

  constructor(container: HTMLElement) {
    this.engine = new Engine(container);

    this.camera = new IsometricCamera();
    this.engine.setCamera(this.camera);
    new PointerHandler(this.camera);

    this.lights = new Lights();
    this.lights.addTo(this.engine.scene);
  }

  async load(mapPath: string = DEFAULT_MAP_PATH): Promise<void> {
    const mapData = await this.mapLoader.load(mapPath);

    const assetLoader = new AssetLoader();
    const [tileAssets, objectAssets, entityAssets, spriteAssets] = await Promise.all([
      TileAssets.preload(assetLoader),
      MapObjectAssets.preload(assetLoader),
      EntityAssets.preload(assetLoader),
      SpriteAssets.preload(assetLoader),
    ]);

    console.log("[Game] Loaded sprites:", spriteAssets.getLoadedSprites());

    this.tileMap = new TileMap(this.engine.scene);
    await this.tileMap.buildFromMap(mapData, tileAssets, objectAssets);

    const entityManager = EntityManager.getInstance();
    const pathfinding = new PathfindingService(this.tileMap);

    const spawn = this.tileMap.getPlayerSpawn();
    const player = new Player(spawn, entityAssets);
    entityManager.add(player, this.engine.scene);
    
    // Устанавливаем начальную позицию сущности
    const spawnPos = this.tileMap.gridToWorldPosition(spawn.q, spawn.r);
    player.position.copy(spawnPos);
    player.syncMeshPosition();

    // Настройка камеры для следования за игроком
    this.camera.setFollowTarget(player);

    const entitySpawns = this.tileMap.getSpawns('enemy');
    
    for (let i = 0; i < entitySpawns.length; i++) {
        const spawn = entitySpawns[i];
        const spawnPos = this.tileMap.gridToWorldPosition(spawn.q, spawn.r);
        const enemy = new Enemy(spawn.name, {q: spawn.q, r: spawn.r}, entityAssets);
        enemy.position.copy(spawnPos);
        enemy.mesh.position.copy(spawnPos);
        entityManager.add(enemy, this.engine.scene);
    }


    // Создаем ProjectileSystem отдельно, чтобы передать её в CombatSystem
    const projectileSystem = new ProjectileSystem(this.engine.scene, spriteAssets, this.eventBus);

    this.systems = [
      new InputSystem(this.engine, this.camera, this.tileMap, entityManager, this.eventBus),
      new SelectionSystem(this.eventBus),
      new MovementSystem(entityManager, pathfinding, this.tileMap, this.eventBus),
      new AnimationSystem(entityManager),
      new BoundsSystem(this.tileMap, this.eventBus, this.engine, this.camera),
      projectileSystem,
      new CombatSystem(
        this.engine.scene, 
        entityAssets, 
        spriteAssets,
        projectileSystem
      )
    ];

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
      
      // Обновление камеры для следования за целью
      this.camera.update();
      
      for (const system of this.systems) {
        system.update(dt);
      }
      this.engine.render();
    };
    loop();
  }

  private initDevTools(): void {
    DevTools.getInstance().initCamera(this.camera);
    DevTools.getInstance().initLights(this.lights);
  }
}
