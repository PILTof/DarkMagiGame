import * as THREE from "three";
import { TILE_SIZE } from "../config/gameConfig.ts";

/** Осевые координаты гекса (flat-top). */
export type GridPos = { q: number; r: number };

const SQRT3 = Math.sqrt(3);

export class GridCoords {
  /** Осевые координаты → мировые XZ (flat-top). */
  static gridToWorld(q: number, r: number): THREE.Vector3 {
    const x = TILE_SIZE * (1.5 * q);
    const z = TILE_SIZE * (SQRT3 * (r + q / 2));
    return new THREE.Vector3(x, 0, z);
  }

  /** Мировые XZ → ближайший гекс (flat-top). */
  static worldToGrid(pos: THREE.Vector3): GridPos {
    const q = ((2 / 3) * pos.x) / TILE_SIZE;
    const r = ((-1 / 3) * pos.x + (SQRT3 / 3) * pos.z) / TILE_SIZE;
    return GridCoords.roundAxial(q, r);
  }

  /** Соседи гекса в осевых координатах. */
  static neighbors(q: number, r: number): GridPos[] {
    return [
      { q: q + 1, r },
      { q: q - 1, r },
      { q, r: r + 1 },
      { q, r: r - 1 },
      { q: q + 1, r: r - 1 },
      { q: q - 1, r: r + 1 },
    ];
  }

  private static roundAxial(q: number, r: number): GridPos {
    const s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    const rs = Math.round(s);

    const dq = Math.abs(rq - q);
    const dr = Math.abs(rr - r);
    const ds = Math.abs(rs - s);

    if (dq > dr && dq > ds) {
      rq = -rr - rs;
    } else if (dr > ds) {
      rr = -rq - rs;
    }

    return { q: rq, r: rr };
  }
}
