import * as THREE from "three";
import { GridCoords, type GridPos } from "./GridCoords.ts";
import { HexGrid } from "./hex/HexGrid.ts";
import type { MapData, MapSpawn } from "./map/MapData.ts";
import {
  createMapObject,
  type MapObjectAssets,
} from "./map/objects/index.ts";
import { createTile, type Tile } from "./tiles/index.ts";
import type { TileAssets } from "./tiles/TileAssets.ts";

export class TileMap {
  readonly group = new THREE.Group();
  readonly objectsGroup = new THREE.Group();
  readonly tiles: Tile[][] = [];
  readonly hexGrid: HexGrid;
  private readonly scene: THREE.Scene;
  private mapData: MapData | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.group);
    this.scene.add(this.objectsGroup);
    this.hexGrid = new HexGrid(0, 0);
  }

  async buildFromMap(
    mapData: MapData,
    tileAssets: TileAssets,
    objectAssets: MapObjectAssets,
  ): Promise<void> {
    this.clear();
    this.mapData = mapData;
    
    // Инициализируем HexGrid с новыми размерами
    Object.assign(this.hexGrid, new HexGrid(mapData.width, mapData.height));
    
    // Регистрируем spawn points в HexGrid
    for (const spawn of mapData.spawns) {
      this.hexGrid.addSpawn(spawn.type, spawn.name, spawn.q, spawn.r);
    }

    await this.buildTerrain(mapData, tileAssets);
    await this.buildObjects(mapData, objectAssets);
    this.centerMap();
  }

  get width(): number {
    return this.hexGrid.getWidth();
  }

  get height(): number {
    return this.hexGrid.getHeight();
  }

  getTile(q: number, r: number): Tile | null {
    if (!this.hexGrid.isInBounds(q, r)) {
      return null;
    }
    return this.tiles[r]?.[q] ?? null;
  }

  isWalkable(q: number, r: number): boolean {
    return this.hexGrid.isWalkable(q, r);
  }

  getPlayerSpawn(): GridPos {
    return this.hexGrid.getPlayerSpawn();
  }

  getSpawns(type?: MapSpawn["type"]): MapSpawn[] {
    const spawns = this.mapData?.spawns ?? [];
    return type ? spawns.filter((spawn) => spawn.type === type) : spawns;
  }

  getHexGrid(): HexGrid {
    return this.hexGrid;
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

  private async buildTerrain(
    mapData: MapData,
    tileAssets: TileAssets,
  ): Promise<void> {
    const { legend, rows } = mapData.terrain;

    const loadTasks: Promise<void>[] = [];

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
        
        // Регистрируем walkability в HexGrid
        this.hexGrid.setBaseWalkable(q, r, tile.walkable);

        const worldPos = GridCoords.gridToWorld(q, r);

        loadTasks.push(
          tile.loadMesh(tileAssets).then((root) => {
            root.position.set(worldPos.x, 0, worldPos.z);

            this.group.add(root);
          }),
        );
      }

      this.tiles.push(row);
    }

    await Promise.all(loadTasks);
  }

  private async buildObjects(
    mapData: MapData,
    objectAssets: MapObjectAssets,
  ): Promise<void> {
    const loadTasks: Promise<void>[] = [];

    for (const object of mapData.objects) {
      const instance = createMapObject(object.type, {
        q: object.q,
        r: object.r,
      });

      loadTasks.push(
        instance.loadMesh(objectAssets).then((root) => {
          const worldPos = GridCoords.gridToWorld(object.q, object.r);
          root.position.set(worldPos.x, 0, worldPos.z);
          this.objectsGroup.add(root);

          for (const cell of instance.getBlockingCells()) {
            this.hexGrid.blockCell(cell.q, cell.r);
          }
        }),
      );
    }

    await Promise.all(loadTasks);
  }

  private centerMap(): void {
    const width = this.hexGrid.getWidth();
    const height = this.hexGrid.getHeight();
    const centerQ = (width - 1) / 2;
    const centerR = (height - 1) / 2;
    const center = GridCoords.gridToWorld(centerQ, centerR);
    const offset = new THREE.Vector3(-center.x, 0, -center.z);
    this.group.position.copy(offset);
    this.objectsGroup.position.copy(offset);
  }

  private clear(): void {
    this.group.clear();
    this.objectsGroup.clear();
    this.tiles.length = 0;
    this.hexGrid.clear();
    this.mapData = null;
  }
}
