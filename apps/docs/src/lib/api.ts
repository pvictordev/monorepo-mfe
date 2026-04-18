import { createApiClient } from "@repo/shared";
import { publicEnv } from "./env";

export const api = createApiClient({
  baseUrl: publicEnv.apiBase,
  getToken: () => null,
});
