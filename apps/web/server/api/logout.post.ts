export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);

  deleteCookie(event, config.public.authCookieName, {
    path: "/",
  });

  return { success: true };
});
