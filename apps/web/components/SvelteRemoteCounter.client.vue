<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";

type RemoteCounterModule = {
  mountRemoteCounter: (
    target: HTMLElement,
    props?: {
      initialCount?: number;
    },
  ) => () => void;
};

type FederatedContainer = {
  init: (shareScope?: Record<string, unknown>) => Promise<void> | void;
  get: (module: string) => Promise<() => RemoteCounterModule> | (() => RemoteCounterModule);
};

const runtimeConfig = useRuntimeConfig();

const target = ref<HTMLElement | null>(null);
const isLoading = ref(true);
const error = ref("");

let cleanup: (() => void) | null = null;

onMounted(async () => {
  await nextTick();

  if (!target.value) {
    error.value = "Could not create the Svelte remote mount target.";
    isLoading.value = false;

    return;
  }

  try {
    const container = (await import(
      /* @vite-ignore */
      runtimeConfig.public.docsRemoteEntry
    )) as FederatedContainer;

    await container.init({});

    const factory = await container.get("./remote-counter");
    const remote = factory();

    cleanup = remote.mountRemoteCounter(target.value, { initialCount: 1 });
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not load the Svelte remote.";
  } finally {
    isLoading.value = false;
  }
});

onBeforeUnmount(() => {
  cleanup?.();
});
</script>

<template>
  <div class="stack">
    <p v-if="isLoading" class="muted">Loading Svelte remote...</p>
    <p v-else-if="error" class="muted">Remote failed to load: {{ error }}</p>
    <div ref="target" />
  </div>
</template>
