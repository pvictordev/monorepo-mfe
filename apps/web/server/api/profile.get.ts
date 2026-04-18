import { createDemoSession } from "../utils/session";

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const token = getCookie(event, config.public.authCookieName);

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });
  }

  return createDemoSession("team@example.com");
});
