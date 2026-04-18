<script lang="ts">
  import Router from "svelte-spa-router";
  import { location } from "svelte-spa-router";
  import { routes as routeComponents } from "./lib/routes";
</script>

<svelte:head>
  <title>Platform docs SPA</title>
  <meta
    name="description"
    content="Svelte SPA replacing the second Next.js app while preserving shared API and auth flows."
  />
</svelte:head>

<div class="shell">
  <header class="shell__header">
    <div>
      <p class="eyebrow">Svelte SPA</p>
      <h1>Platform docs app</h1>
    </div>

    <nav class="shell__nav">
      <a class:active={$location === "/"} href="#/">Home</a>
      <a class:active={$location === "/dashboard"} href="#/dashboard">Dashboard</a>
      <a class:active={$location === "/login"} href="#/login">Login</a>
    </nav>
  </header>

  <main class="shell__main">
    <Router routes={routeComponents} />
  </main>
</div>
