<script lang="ts">
  import { api } from "../lib/api";
  import { setSession } from "../lib/auth";

  let email = "team@example.com";
  let pending = false;
  let error = "";

  const submit = async () => {
    pending = true;
    error = "";

    try {
      const session = await api.login(email);
      setSession(session);
      window.location.hash = "#/dashboard";
    } catch (err) {
      error = err instanceof Error ? err.message : "Login failed";
    } finally {
      pending = false;
    }
  };
</script>

<section class="panel stack">
  <p class="eyebrow">Shared auth</p>
  <h2>Login</h2>
  <p class="muted">
    The SPA calls the same `/api/login` route as the Nuxt app. In development, Vite proxies `/api` to the Nuxt SSR
    server to avoid CORS issues and cookie drift.
  </p>

  <label class="stack">
    <span>Email</span>
    <input bind:value={email} class="input" type="email" autocomplete="email" />
  </label>

  <button class="cta" disabled={pending} on:click={submit}>
    {pending ? "Signing in..." : "Sign in"}
  </button>

  {#if error}
    <p class="muted">{error}</p>
  {/if}
</section>
