import { createApiClient } from "@repo/shared";

export const usePlatformApi = () => {
  const config = useRuntimeConfig();
  const session = useCookie<string | null>(config.public.authCookieName, {
    default: () => null,
    sameSite: "lax",
  });

  return createApiClient({
    baseUrl: config.public.apiBase,
    getToken: () => session.value,
  });
};
