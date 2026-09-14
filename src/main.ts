import "./style.css";
import { createGameSession } from "./app/createGameSession.ts";

const container = document.getElementById("app");
if (!container) {
  throw new Error("Container #app not found");
}

const session = createGameSession(container);

try {
  await session.load();
  session.start();
} catch (error) {
  console.error("Failed to start game:", error);
}
