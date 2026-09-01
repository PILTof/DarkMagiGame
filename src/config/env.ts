function readNumber(key: keyof ImportMetaEnv, fallback: number): number {
  const raw = import.meta.env[key];
  if (raw === undefined || raw === "") return fallback;

  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function readBoolean(key: keyof ImportMetaEnv, fallback: boolean): boolean {
  const raw = import.meta.env[key];
  if (raw === undefined || raw === "") return fallback;

  return raw === "true" || raw === "1";
}

export const env = {
  unitSpeed: readNumber("VITE_UNIT_SPEED", 4),
  debug: readBoolean("VITE_DEBUG", import.meta.env.DEV),
};
