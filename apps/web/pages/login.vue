<script setup lang="ts">
import { routes } from "@repo/shared";

const email = ref("team@example.com");
const pending = ref(false);
const error = ref("");
const api = usePlatformApi();

const submit = async () => {
  pending.value = true;
  error.value = "";

  try {
    await api.login(email.value);
    await navigateTo(routes.dashboard);
  } catch (submissionError) {
    error.value = submissionError instanceof Error ? submissionError.message : "Login failed";
  } finally {
    pending.value = false;
  }
};
</script>

<template>
  <section class="panel stack">
    <p class="eyebrow">Auth flow</p>
    <h2>Login route moved from Next.js to Nuxt</h2>
    <p class="muted">
      Sensitive values stay on the server via <code>runtimeConfig</code>. Only <code>NUXT_PUBLIC_*</code> values
      are exposed to the browser.
    </p>

    <label class="stack">
      <span>Email</span>
      <input v-model="email" class="input" type="email" autocomplete="email" />
    </label>

    <button class="cta" :disabled="pending" @click="submit">
      {{ pending ? "Signing in..." : "Sign in" }}
    </button>

    <p v-if="error" class="muted">{{ error }}</p>
  </section>
</template>
