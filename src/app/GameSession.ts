import { env } from "../config/env.ts";
import { DEFAULT_MAP_PATH } from "../config/gameConfig.ts";
import { CommandDispatcher } from "../commands/CommandDispatcher.ts";
import { Clock } from "../core/Clock.ts";
import { EventBus } from "../core/EventBus.ts";
import { DevTools } from "../dev/DevTools.ts";
import { AssetLoader } from "../engine/AssetLoader.ts";
import { Engine } from "../engine/Engine.ts";
import { IsometricCamera } from "../engine/IsometricCamera.ts";
import { Lights } from "../engine/Lights.ts";
import { Enemy } from "../entities/Enemy.ts";
import { EntityAssets } from "../entities/EntityAssets.ts";
import { EntityManager } from "../entities/EntityManager.ts";
import { Player } from "../entities/Player.ts";
import { ProjectileManager } from "../entities/projectiles/ProjectileManager.ts";
import { SpriteAssets } from "../entities/SpriteAssets.ts";
import { PointerHandler } from "../input/PointerHandler.ts";
import { ARCANE_BURST } from "../skills/ArcaneBurst.ts";
import { ActiveSkillSlot } from "../skills/ActiveSkillSlot.ts";
import { SkillRegistry } from "../skills/SkillRegistry.ts";
import { AnimationSystem } from "../systems/AnimationSystem.ts";
import { BoundsSystem } from "../systems/BoundsSystem.ts";
import { CastSystem } from "../systems/CastSystem.ts";
import { CombatSystem } from "../systems/Combat/CombatSystem.ts";
import { DeathSystem } from "../systems/DeathSystem.ts";
import { InputSystem } from "../systems/InputSystem.ts";
import { MovementSystem } from "../systems/MovementSystem.ts";
import { SelectionSystem } from "../systems/SelectionSystem.ts";
import type { System } from "../systems/System.ts";
import { TileInteractionSystem } from "../systems/TileInteractionSystem.ts";
import { TileVisualSystem } from "../systems/TileVisualSystem.ts";
import { MapLoader } from "../world/map/index.ts";
import { MapObjectAssets } from "../world/map/objects/index.ts";
import { PathfindingService } from "../world/PathfindingService.ts";
import { TileMap } from "../world/TileMap.ts";
import { TileAssets } from "../world/tiles/TileAssets.ts";

export class GameSession {
  private readonly clock = new Clock();
  private readonly eventBus = new EventBus();
  private readonly entityManager = new EntityManager();
  private readonly commandDispatcher = new CommandDispatcher();
  private readonly skillRegistry = new SkillRegistry();
  private readonly activeSkillSlot = new ActiveSkillSlot();
  private readonly engine: Engine;
  private readonly camera: IsometricCamera;
  private readonly lights: Lights;
  private readonly pointerHandler: PointerHandler;
  private tileMap: TileMap | null = null;
  private systems: System[] = [];
  private animationFrameId: number | null = null;
  private readonly mapLoader = new MapLoader();

  constructor(container: HTMLElement) {
    this.engine = new Engine(container);
    this.camera = new IsometricCamera();
    this.engine.setCamera(this.camera);
    this.pointerHandler = new PointerHandler(this.camera);
    this.lights = new Lights();
    this.lights.addTo(this.engine.scene);
    
    // Register skills
    this.skillRegistry.register(ARCANE_BURST);
    // Set default active skill
    this.activeSkillSlot.setActive(ARCANE_BURST);
  }

  async load(mapPath: string = DEFAULT_MAP_PATH): Promise<void> {
    const mapData = await this.mapLoader.load(mapPath);
    const assetLoader = new AssetLoader();
    const [tileAssets, objectAssets, entityAssets, spriteAssets] = await Promise.all([
      TileAssets.preload(assetLoader), MapObjectAssets.preload(assetLoader),
      EntityAssets.preload(assetLoader), SpriteAssets.preload(assetLoader),
    ]);
    console.log("[GameSession] Loaded sprites:", spriteAssets.getLoadedSprites());
    this.tileMap = new TileMap(this.engine.scene);
    await this.tileMap.buildFromMap(mapData, tileAssets, objectAssets);
    const pathfinding = new PathfindingService(this.tileMap);
    const hexGrid = this.tileMap.getHexGrid();
    const spawn = hexGrid.getPlayerSpawn();
    const player = new Player(spawn, entityAssets);
    this.entityManager.add(player, this.engine.scene);
    player.position.copy(this.tileMap.gridToWorldPosition(spawn.q, spawn.r));
    player.syncMeshPosition();
    this.camera.setFollowTarget(player);
    for (const spawn of hexGrid.getSpawns("enemy")) {
      const enemy = new Enemy(spawn.name, { q: spawn.q, r: spawn.r }, entityAssets);
      const spawnPos = this.tileMap.gridToWorldPosition(spawn.q, spawn.r);
      enemy.position.copy(spawnPos);
      enemy.mesh.position.copy(spawnPos);
      this.entityManager.add(enemy, this.engine.scene);
    }
    const projectileManager = new ProjectileManager(this.engine.scene, this.entityManager);
    const boundsSystem = new BoundsSystem(this.tileMap, this.commandDispatcher, this.eventBus, this.engine, this.camera, this.entityManager);
    const movementSystem = new MovementSystem(this.entityManager, pathfinding, this.tileMap, hexGrid, this.eventBus);
    const castSystem = new CastSystem(this.tileMap, hexGrid, boundsSystem, this.eventBus, this.entityManager, this.skillRegistry);
    
    // Register command handlers
    this.commandDispatcher.registerHandler(movementSystem);
    this.commandDispatcher.registerHandler(castSystem);
    
    this.systems = [
      new InputSystem(this.engine, this.camera, this.tileMap, this.entityManager, this.eventBus),
      new SelectionSystem(this.eventBus),
      movementSystem,
      new TileInteractionSystem(this.tileMap, this.eventBus, this.entityManager, this.activeSkillSlot, this.commandDispatcher),
      new TileVisualSystem(this.tileMap, this.eventBus), boundsSystem,
      castSystem,
      new AnimationSystem(this.entityManager),
      new CombatSystem(this.eventBus, projectileManager),
      new DeathSystem(this.engine.scene, this.entityManager),
    ];
    if (env.debug) this.initDevTools();
  }

  start(): void {
    if (!this.tileMap) throw new Error("Call GameSession.load() before start()");
    const loop = (): void => {
      this.animationFrameId = requestAnimationFrame(loop);
      const dt = this.clock.getDelta();
      this.camera.update();
      for (const system of this.systems) system.update(dt);
      this.engine.render();
    };
    loop();
  }

  dispose(): void {
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
    this.eventBus.clear();
    this.pointerHandler.dispose();
    this.engine.dispose();
    this.systems = [];
    this.tileMap = null;
  }

  private initDevTools(): void {
    DevTools.getInstance().initCamera(this.camera);
    DevTools.getInstance().initLights(this.lights);
  }
}
