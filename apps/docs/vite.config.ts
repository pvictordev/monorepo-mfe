import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { federation } from "@module-federation/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      svelte(),
      federation({
        name: "docs_remote",
        filename: "remoteEntry.js",
        exposes: {
          "./remote-counter": "./src/mfe/remote-counter.ts",
        },
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@shared": fileURLToPath(new URL("../../packages/shared/src", import.meta.url)),
      },
    },
    server: {
      origin: "http://localhost:3001",
      cors: true,
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY_TARGET || "http://localhost:3000",
          changeOrigin: false,
          secure: false,
        },
      },
    },
    preview: {
      port: 3001,
    },
    build: {
      target: "chrome89",
    },
  };
});
