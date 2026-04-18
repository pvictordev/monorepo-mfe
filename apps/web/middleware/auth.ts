export default defineNuxtRouteMiddleware(() => {
  const config = useRuntimeConfig();
  const session = useCookie<string | null>(config.public.authCookieName);

  if (!session.value) {
    return navigateTo("/login");
  }
});
