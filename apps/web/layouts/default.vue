<script setup lang="ts">
import { routes } from "@repo/shared";

const route = useRoute();
</script>

<template>
  <div class="shell">
    <header class="shell__header">
      <div>
        <p class="eyebrow">Nuxt 3 SSR</p>
        <h1>Platform web app</h1>
      </div>

      <nav class="shell__nav">
        <NuxtLink :class="{ active: route.path === routes.home }" :to="routes.home">Home</NuxtLink>
        <NuxtLink :class="{ active: route.path === routes.dashboard }" :to="routes.dashboard">Dashboard</NuxtLink>
        <NuxtLink :class="{ active: route.path === routes.login }" :to="routes.login">Login</NuxtLink>
      </nav>
    </header>

    <main class="shell__main">
      <slot />
    </main>
  </div>
</template>
