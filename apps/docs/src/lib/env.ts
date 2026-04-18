import { resolvePublicEnv } from "@repo/shared";

export const publicEnv = resolvePublicEnv(import.meta.env, {
  apiBase: "/api",
  appName: "docs",
});
