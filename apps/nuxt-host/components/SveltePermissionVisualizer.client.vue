<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

type PermissionVisualizerProps = {
  apiBase: string;
  initialUserId?: string;
};

type PermissionVisualizerModule = {
  mountPermissionVisualizer: (target: HTMLElement, props: PermissionVisualizerProps) => () => void;
};

type FederatedContainer = {
  init: (shareScope?: Record<string, unknown>) => Promise<void> | void;
  get: (module: string) => Promise<() => PermissionVisualizerModule> | (() => PermissionVisualizerModule);
};

const props = defineProps<{
  selectedUserId?: string;
  simulateMountFailure: boolean;
}>();

const runtimeConfig = useRuntimeConfig();
const target = ref<HTMLElement | null>(null);
const isLoading = ref(false);
const error = ref("");

let cleanup: (() => void) | null = null;

async function mountRemote() {
  cleanup?.();
  cleanup = null;
  error.value = "";

  await nextTick();

  if (!target.value) {
    error.value = "The Svelte mount target is unavailable.";
    return;
  }

  if (props.simulateMountFailure) {
    error.value = "Svelte widget mount failure is being simulated.";
    return;
  }

  isLoading.value = true;

  try {
    const container = (await import(
      /* @vite-ignore */
      String(runtimeConfig.public.visualizerRemoteEntry)
    )) as FederatedContainer;

    await container.init({});

    const factory = await container.get("./permission-visualizer");
    const remote = factory();

    cleanup = remote.mountPermissionVisualizer(target.value, {
      apiBase: String(runtimeConfig.public.apiBase),
      initialUserId: props.selectedUserId,
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Could not load the Svelte visualizer.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void mountRemote();
});

watch(
  () => props.simulateMountFailure,
  () => {
    void mountRemote();
  },
);

onBeforeUnmount(() => {
  cleanup?.();
});
</script>

<template>
  <div class="host-visualizer-frame mfe-surface">
    <div v-if="isLoading" class="host-remote-state">Loading Svelte visualizer...</div>
    <div v-if="error" class="host-remote-state host-remote-state--error">
      <strong>Optional widget unavailable.</strong>
      <span>{{ error }}</span>
      <span>The Nuxt role workflow is still fully usable.</span>
    </div>
    <div ref="target" />
  </div>
</template>
