<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const { data: session, error } = await useFetch("/api/profile", {
  credentials: "include",
});
</script>

<template>
  <section class="stack">
    <div class="panel stack">
      <p class="eyebrow">Protected route</p>
      <h2>Dashboard</h2>
      <p class="muted">
        This page demonstrates Nuxt SSR data loading with a server route and cookie-based auth check.
      </p>
      <p v-if="error" class="muted">Could not load the current profile.</p>
      <template v-else-if="session">
        <p><strong>User:</strong> {{ session.user.name }} ({{ session.user.email }})</p>
        <p><strong>Role:</strong> {{ session.user.role }}</p>
      </template>
    </div>
  </section>
</template>
