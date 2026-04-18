<script lang="ts">
  import { dashboardHighlights } from "@repo/shared";
  import { onMount } from "svelte";
  import { api } from "../lib/api";

  let status: Awaited<ReturnType<typeof api.getStatus>> | null = null;
  let error = "";

  onMount(async () => {
    try {
      status = await api.getStatus();
    } catch (err) {
      error = err instanceof Error ? err.message : "Could not load platform status";
    }
  });
</script>

<section class="stack">
  <div class="panel stack">
    <p class="eyebrow">Migration target</p>
    <h2>Client-rendered Svelte app replacing the second Next.js app</h2>
    <p class="muted">
      Routing is handled on the client, and API/auth calls reuse the shared package so behavior stays aligned with
      the Nuxt app.
    </p>
    <ul class="list">
      {#each dashboardHighlights as item}
        <li>{item}</li>
      {/each}
    </ul>
  </div>

  <div class="panel stack">
    <h3>API connectivity</h3>
    {#if error}
      <p class="muted">{error}</p>
    {:else if status}
      <p><strong>App:</strong> {status.app}</p>
      <p><strong>Timestamp:</strong> {status.timestamp}</p>
      <p><strong>Routes:</strong> {status.routes.join(", ")}</p>
    {:else}
      <p class="muted">Loading...</p>
    {/if}
  </div>
</section>
