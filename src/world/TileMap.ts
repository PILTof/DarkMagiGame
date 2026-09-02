import * as THREE from "three";
import { env } from "../config/env.ts";
import { EventBus } from "../core/EventBus.ts";
import { DevTools } from "../dev/DevTools.ts";
import { GridCoords, type GridPos } from "./GridCoords.ts";
import type { MapData, MapSpawn } from "./map/MapData.ts";
import { MapObjects } from "./map/MapObjects.ts";
import { createTile, type Tile } from "./tiles/index.ts";

export class TileMap {
  readonly group = new THREE.Group();
  readonly objectsGroup = new THREE.Group();
  readonly tiles: Tile[][] = [];
  private readonly blockedCells = new Set<string>();
  private readonly scene: THREE.Scene;
  private mapData: MapData | null = null;
  private mapWidth = 0;
  private mapHeight = 0;
  private readonly mapObjects: MapObjects;
  private readonly eventBus: EventBus;

  constructor(scene: THREE.Scene, mapObjects = new MapObjects()) {
    this.scene = scene;
    this.mapObjects = mapObjects;
    this.scene.add(this.group);
    this.scene.add(this.objectsGroup);
    this.eventBus = EventBus.getInstance();
  }

  buildFromMap(mapData: MapData): void {
    this.clear();
    this.mapData = mapData;
    this.mapWidth = mapData.width;
    this.mapHeight = mapData.height;

    this.buildTerrain(mapData);
    this.buildObjects(mapData);
    this.centerMap();
  }

  get width(): number {
    return this.mapWidth;
  }

  get height(): number {
    return this.mapHeight;
  }

  getTile(q: number, r: number): Tile | null {
    if (q < 0 || r < 0 || q >= this.mapWidth || r >= this.mapHeight) {
      return null;
    }
    return this.tiles[r]?.[q] ?? null;
  }

  isWalkable(q: number, r: number): boolean {
    const tile = this.getTile(q, r);
    if (!tile?.walkable) return false;
    return !this.blockedCells.has(this.cellKey(q, r));
  }

  getPlayerSpawn(): GridPos {
    const spawn = this.mapData?.spawns.find((entry) => entry.type === "player");
    if (spawn && this.isWalkable(spawn.q, spawn.r)) {
      return { q: spawn.q, r: spawn.r };
    }
    return this.findFallbackSpawn();
  }

  getSpawns(type?: MapSpawn["type"]): MapSpawn[] {
    const spawns = this.mapData?.spawns ?? [];
    return type ? spawns.filter((spawn) => spawn.type === type) : spawns;
  }

  /** Мировая позиция центра гекса с учётом смещения карты. */
  gridToWorldPosition(q: number, r: number, y = 0): THREE.Vector3 {
    const local = GridCoords.gridToWorld(q, r);
    return new THREE.Vector3(
      local.x + this.group.position.x,
      y,
      local.z + this.group.position.z,
    );
  }

  /** Мировые координаты → ближайший гекс карты. */
  worldToGrid(worldPos: THREE.Vector3): GridPos {
    const local = new THREE.Vector3(
      worldPos.x - this.group.position.x,
      worldPos.y,
      worldPos.z - this.group.position.z,
    );
    return GridCoords.worldToGrid(local);
  }

  private buildTerrain(mapData: MapData): void {
    const { legend, rows } = mapData.terrain;


    const outlineMaterial = new THREE.MeshToonMaterial({
      color: 'black',
      wireframe: true
    });

    if (env.debug) {
      DevTools.getInstance().initWireframe(outlineMaterial)
    }

    for (let r = 0; r < mapData.height; r++) {
      const row: Tile[] = [];
      const rowData = rows[r]!;

      for (let q = 0; q < mapData.width; q++) {
        const char = rowData[q]!;
        const type = legend[char];
        if (!type) {
          throw new Error(`Unknown terrain char "${char}" at (${q}, ${r})`);
        }

        const tile = createTile(type, { q, r });
        row.push(tile);

        const worldPos = GridCoords.gridToWorld(q, r);
        tile.mesh.position.x = worldPos.x;
        tile.mesh.position.z = worldPos.z;

        if (env.debug) {
          this.addOutLine(tile.mesh, outlineMaterial);
        }



        this.group.add(tile.mesh);
      }

      this.tiles.push(row);
    }
  }

  private addOutLine(mesh: THREE.Mesh, outlineMaterial: THREE.MeshToonMaterial):void
  {

    const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMaterial);
    // outlineMesh.scale.multiplyScalar(1);

    mesh.add(outlineMesh);
  }

  private buildObjects(mapData: MapData): void {
    for (const object of mapData.objects) {
      const mesh = this.mapObjects.create(object.type);
      const worldPos = GridCoords.gridToWorld(object.q, object.r);
      mesh.position.set(worldPos.x, 0, worldPos.z);
      mesh.userData.q = object.q;
      mesh.userData.r = object.r;
      this.objectsGroup.add(mesh);

      if (this.mapObjects.isBlocking(object.type)) {
        for (const cell of this.mapObjects.getBlockingCells(
          object.type,
          object.q,
          object.r,
        )) {
          if (
            cell.q >= 0 &&
            cell.r >= 0 &&
            cell.q < this.mapWidth &&
            cell.r < this.mapHeight
          ) {
            this.blockedCells.add(this.cellKey(cell.q, cell.r));
          }
        }
      }
    }
  }

  private findFallbackSpawn(): GridPos {
    const centerQ = Math.floor(this.mapWidth / 2);
    const centerR = Math.floor(this.mapHeight / 2);

    if (this.isWalkable(centerQ, centerR)) {
      return { q: centerQ, r: centerR };
    }

    for (let r = 0; r < this.mapHeight; r++) {
      for (let q = 0; q < this.mapWidth; q++) {
        if (this.isWalkable(q, r)) {
          return { q, r };
        }
      }
    }

    return { q: centerQ, r: centerR };
  }

  private centerMap(): void {
    const centerQ = (this.mapWidth - 1) / 2;
    const centerR = (this.mapHeight - 1) / 2;
    const center = GridCoords.gridToWorld(centerQ, centerR);
    const offset = new THREE.Vector3(-center.x, 0, -center.z);
    this.group.position.copy(offset);
    this.objectsGroup.position.copy(offset);
  }

  private cellKey(q: number, r: number): string {
    return `${q},${r}`;
  }

  private clear(): void {
    this.group.clear();
    this.objectsGroup.clear();
    this.tiles.length = 0;
    this.blockedCells.clear();
    this.mapData = null;
    this.mapWidth = 0;
    this.mapHeight = 0;
  }
}
