import type { IsometricCamera } from "../engine/IsometricCamera.ts";

export async function initDevTools(
  camera: IsometricCamera,
): Promise<{ dispose: () => void } | null> {
  if (!import.meta.env.DEV) {
    return null;
  }

  const { DevTools } = await import("./DevTools.ts");
  const devTools = new DevTools(camera);
  return { dispose: () => devTools.dispose() };
}
