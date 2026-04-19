import { federation } from "@module-federation/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      svelte(),
      federation({
        name: "permission_visualizer",
        filename: "remoteEntry.js",
        exposes: {
          "./permission-visualizer": "./src/mfe/permission-visualizer.ts",
        },
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      cors: true,
      origin: "http://localhost:3012",
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY_TARGET || "http://localhost:3010",
          changeOrigin: false,
          secure: false,
        },
      },
    },
    preview: {
      port: 3012,
    },
    build: {
      target: "chrome89",
    },
  };
});
