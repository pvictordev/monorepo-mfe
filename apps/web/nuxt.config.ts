export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  alias: {
    "@shared": "../../packages/shared/src",
  },
  runtimeConfig: {
    apiSecret: process.env.NUXT_API_SECRET ?? "",
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "/api",
      appName: process.env.NUXT_PUBLIC_APP_NAME ?? "web",
      authCookieName: process.env.NUXT_PUBLIC_AUTH_COOKIE_NAME ?? "platform_session",
    },
  },
  nitro: {
    routeRules: {
      "/api/**": {
        cors: false,
      },
    },
  },
  compatibilityDate: "2025-01-01",
});
