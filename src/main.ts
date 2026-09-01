import "./style.css";
import { Game } from "./core/Game.ts";

const container = document.getElementById("app");
if (!container) {
  throw new Error("Container #app not found");
}

const game = new Game(container);
game.start();
