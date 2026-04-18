<script setup lang="ts">
import { dashboardHighlights, routes } from "@repo/shared";

const api = usePlatformApi();

const { data: status, error } = await useAsyncData("platform-status", () => api.getStatus());
</script>

<template>
  <section class="stack">
    <div class="panel stack">
      <p class="eyebrow">Migration target</p>
      <h2>SSR-first Nuxt application replacing the original Next.js app</h2>
      <p class="muted">
        Business logic, auth, routes, and API helpers are intentionally hosted in <code>packages/shared</code>
        so the Svelte SPA can consume the same primitives.
      </p>
      <ul class="list">
        <li v-for="item in dashboardHighlights" :key="item">{{ item }}</li>
      </ul>
      <NuxtLink class="cta" :to="routes.dashboard">Open SSR dashboard</NuxtLink>
    </div>

    <div class="panel stack">
      <h3>Server data fetch</h3>
      <p v-if="error" class="muted">Could not load status: {{ error.message }}</p>
      <template v-else-if="status">
        <p><strong>App:</strong> {{ status.app }}</p>
        <p><strong>Timestamp:</strong> {{ status.timestamp }}</p>
        <p><strong>Routes:</strong> {{ status.routes.join(", ") }}</p>
      </template>
    </div>
  </section>
</template>
