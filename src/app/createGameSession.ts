import { GameSession } from "./GameSession.ts";

export function createGameSession(container: HTMLElement): GameSession {
  return new GameSession(container);
}
