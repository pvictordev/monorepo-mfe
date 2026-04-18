import { routes } from "@repo/shared";

export default defineEventHandler(() => ({
  status: "ok",
  app: "web",
  timestamp: new Date().toISOString(),
  routes: Object.values(routes),
}));
