import type { GridPos } from "../GridCoords.ts";

export type CellWalkability = "walkable" | "blocked" | "out-of-bounds";

/**
 * Чистая hex-grid domain без привязки к Three.js.
 * Управляет walkability, bounds, spawn points.
 */
export class HexGrid {
  private readonly width: number;
  private readonly height: number;
  private readonly walkableMap: Map<string, boolean> = new Map();
  private readonly blockedCells: Set<string> = new Set();
  private spawns: Array<{ type: string; name: string; q: number; r: number }> = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  /** Проверяет, находится ли клетка в пределах карты. */
  isInBounds(q: number, r: number): boolean {
    return q >= 0 && r >= 0 && q < this.width && r < this.height;
  }

  /** Устанавливает базовую walkability тайла (из terrain definition). */
  setBaseWalkable(q: number, r: number, walkable: boolean): void {
    if (!this.isInBounds(q, r)) return;
    this.walkableMap.set(this.cellKey(q, r), walkable);
  }

  /** Помечает клетку как заблокированную объектом (деревом, зданием). */
  blockCell(q: number, r: number): void {
    if (!this.isInBounds(q, r)) return;
    this.blockedCells.add(this.cellKey(q, r));
  }

  /** Проверяет walkability с учётом базового флага и блокирующих объектов. */
  isWalkable(q: number, r: number): boolean {
    if (!this.isInBounds(q, r)) return false;
    const key = this.cellKey(q, r);
    if (this.blockedCells.has(key)) return false;
    return this.walkableMap.get(key) ?? false;
  }

  /** Получает walkability status клетки. */
  getCellWalkability(q: number, r: number): CellWalkability {
    if (!this.isInBounds(q, r)) return "out-of-bounds";
    if (this.blockedCells.has(this.cellKey(q, r))) return "blocked";
    return this.isWalkable(q, r) ? "walkable" : "blocked";
  }

  /** Регистрирует spawn point. */
  addSpawn(type: string, name: string, q: number, r: number): void {
    this.spawns.push({ type, name, q, r });
  }

  /** Возвращает все spawn points (опционально фильтрованные по типу). */
  getSpawns(type?: string): ReadonlyArray<{ type: string; name: string; q: number; r: number }> {
    return type ? this.spawns.filter((s) => s.type === type) : this.spawns;
  }

  /** Находит spawn точку игрока или fallback. */
  getPlayerSpawn(): GridPos {
    const spawn = this.spawns.find((s) => s.type === "player");
    if (spawn && this.isWalkable(spawn.q, spawn.r)) {
      return { q: spawn.q, r: spawn.r };
    }
    return this.findFallbackSpawn();
  }

  /** Fallback: центр карты или первая walkable клетка. */
  private findFallbackSpawn(): GridPos {
    const centerQ = Math.floor(this.width / 2);
    const centerR = Math.floor(this.height / 2);

    if (this.isWalkable(centerQ, centerR)) {
      return { q: centerQ, r: centerR };
    }

    for (let r = 0; r < this.height; r++) {
      for (let q = 0; q < this.width; q++) {
        if (this.isWalkable(q, r)) {
          return { q, r };
        }
      }
    }

    return { q: centerQ, r: centerR };
  }

  private cellKey(q: number, r: number): string {
    return `${q},${r}`;
  }

  /** Очистка для переиспользования. */
  clear(): void {
    this.walkableMap.clear();
    this.blockedCells.clear();
    this.spawns = [];
  }
}
