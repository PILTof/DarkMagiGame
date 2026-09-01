import type { EventBus } from "../core/EventBus.ts";
import type { EntityManager } from "../entities/EntityManager.ts";
import type { PathfindingService } from "../world/PathfindingService.ts";
import type { System } from "./System.ts";

export class MovementSystem implements System {
  private readonly entityManager: EntityManager;
  private readonly pathfinding: PathfindingService;
  private readonly eventBus: EventBus;

  constructor(
    entityManager: EntityManager,
    pathfinding: PathfindingService,
    eventBus: EventBus,
  ) {
    this.entityManager = entityManager;
    this.pathfinding = pathfinding;
    this.eventBus = eventBus;
    this.eventBus.on("move:request", (payload) => {
      this.onMoveRequest(payload);
    });
  }

  update(_dt: number): void {
    void this.entityManager;
    void this.pathfinding;
  }

  private onMoveRequest(_payload: unknown): void {
    // TODO: движение по пути
  }
}
