/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UNIT_SPEED: string;
  readonly VITE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
