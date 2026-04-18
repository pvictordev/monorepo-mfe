import type { AppEnv } from "./types";

type EnvSource = Record<string, string | undefined>;

const pick = (env: EnvSource, keys: string[], fallback: string) => {
  for (const key of keys) {
    const value = env[key];
    if (value) {
      return value;
    }
  }

  return fallback;
};

export const resolvePublicEnv = (
  env: EnvSource,
  defaults: Partial<AppEnv> = {},
): AppEnv => ({
  apiBase: pick(env, ["NUXT_PUBLIC_API_BASE", "VITE_PUBLIC_API_BASE"], defaults.apiBase ?? "/api"),
  appName: pick(env, ["NUXT_PUBLIC_APP_NAME", "VITE_PUBLIC_APP_NAME"], defaults.appName ?? "platform"),
  authCookieName: pick(
    env,
    ["NUXT_PUBLIC_AUTH_COOKIE_NAME", "VITE_PUBLIC_AUTH_COOKIE_NAME"],
    defaults.authCookieName ?? "platform_session",
  ),
});
