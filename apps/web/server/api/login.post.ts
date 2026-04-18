import { createDemoSession } from "../utils/session";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody<{ email?: string }>(event);
  const email = body.email?.trim() || "team@example.com";
  const session = createDemoSession(email);

  setCookie(event, config.public.authCookieName, session.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return session;
});
