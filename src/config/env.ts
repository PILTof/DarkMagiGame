function readBoolean(key: keyof ImportMetaEnv, fallback: boolean): boolean {
  const raw = import.meta.env[key];
  if (raw === undefined || raw === "") return fallback;

  return raw === "true" || raw === "1";
}

export const env = {
  debug: readBoolean("VITE_DEBUG", import.meta.env.DEV),
};
