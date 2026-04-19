const visualizerRemoteEntry =
  process.env.NUXT_PUBLIC_VISUALIZER_REMOTE_ENTRY ??
  "http://localhost:5173/remoteEntry.js";

export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  css: ["@repo/design-system/tokens.css", "~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "/api",
      appName: "nuxt-host",
      visualizerRemoteEntry,
    },
  },
  build: {
    transpile: ["@repo/contracts", "@repo/headless", "@repo/event-bus"],
  },
  nitro: {
    routeRules: {
      "/api/**": {
        cors: false,
      },
    },
  },
  vite: {
    server: {
      origin: "http://localhost:3000",
    },
    build: {
      target: "chrome89",
    },
  },
  compatibilityDate: "2025-01-01",
});
