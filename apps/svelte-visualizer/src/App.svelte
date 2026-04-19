<script lang="ts">
  import PermissionVisualizer from "./lib/PermissionVisualizer.svelte";
</script>

<main class="standalone">
  <section class="standalone__header">
    <p class="standalone__eyebrow">Independent Svelte app</p>
    <h1>Permission visualizer</h1>
    <p>
      This app can run alone against the Nuxt API proxy, or mount inside the Nuxt host as an optional
      microfrontend panel.
    </p>
  </section>

  <PermissionVisualizer apiBase="/api" />
</main>
