import dotenv from "dotenv";
import { defineConfig, loadEnv } from "vite";

// Загружает .env до старта Vite (в т.ч. переменные без префикса VITE_ для конфига сборки).
dotenv.config();

export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), "");
  return {};
});
