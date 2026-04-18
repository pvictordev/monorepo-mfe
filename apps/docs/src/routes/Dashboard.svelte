<script lang="ts">
  import { onMount } from "svelte";
  import { session, setSession } from "../lib/auth";
  import { api } from "../lib/api";

  let error = "";

  onMount(async () => {
    try {
      if (!$session) {
        setSession(await api.getProfile());
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Could not load profile";
    }
  });
</script>

<section class="panel stack">
  <p class="eyebrow">Protected area</p>
  <h2>Dashboard</h2>

  {#if error}
    <p class="muted">{error}</p>
  {:else if $session}
    <p><strong>User:</strong> {$session.user.name} ({$session.user.email})</p>
    <p><strong>Role:</strong> {$session.user.role}</p>
  {:else}
    <p class="muted">Loading...</p>
  {/if}
</section>
