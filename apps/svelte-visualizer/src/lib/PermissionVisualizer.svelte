<script lang="ts">
  import { onMount } from "svelte";
  import { type PermissionAnalysis, type Role, type User } from "@repo/contracts";
  import { subscribeToDomainEvent, publishDomainEvent } from "@repo/event-bus";
  import { permissionLabels } from "@repo/headless";
  import { createPermissionApiClient } from "@repo/sdk";

  type VisualizerStatus = "loading" | "ready" | "degraded" | "error";

  let { apiBase = "/api", initialUserId }: { apiBase?: string; initialUserId?: string } = $props();

  let users = $state<User[]>([]);
  let roles = $state<Role[]>([]);
  let selectedUserId = $state("");
  let analysis = $state<PermissionAnalysis | null>(null);
  let status = $state<VisualizerStatus>("loading");
  let busEnabled = $state(true);
  let message = $state("Hydrating from the Nuxt API.");

  const selectedUser = $derived(users.find((user) => user.id === selectedUserId) ?? null);
  const activeRoleNames = $derived(
    analysis?.roles.map((role) => role.name).join(", ") || "No roles assigned",
  );

  function getClient() {
    return createPermissionApiClient({ baseUrl: apiBase });
  }

  async function loadAnalysis(reason: string) {
    if (!selectedUserId) {
      analysis = null;
      return;
    }

    const response = await getClient().getEffectivePermissions(selectedUserId);

    analysis = response.analysis;
    status = busEnabled ? "ready" : "degraded";
    message = reason;
  }

  async function rehydrate(reason: string) {
    status = busEnabled ? "loading" : "degraded";
    message = reason;

    try {
      const state = await getClient().getState();

      users = state.users;
      roles = state.roles;
      selectedUserId = selectedUserId || state.users[0]?.id || "";

      await loadAnalysis(`${reason} Source of truth was refreshed from the API.`);

      if (selectedUserId) {
        publishDomainEvent({
          type: "VISUALIZER_REHYDRATED",
          payload: {
            userId: selectedUserId,
            source: "api",
          },
        });
      }
    } catch (err) {
      status = "error";
      message = err instanceof Error ? err.message : "Could not rehydrate from the Nuxt API.";
    }
  }

  onMount(() => {
    selectedUserId = initialUserId ?? selectedUserId;

    const cleanup = [
      subscribeToDomainEvent("USER_SELECTED", (event) => {
        selectedUserId = event.payload.userId;
        void loadAnalysis("Selection arrived through USER_SELECTED.");
      }),
      subscribeToDomainEvent("USER_ROLES_UPDATED", (event) => {
        const nextUsers = users.filter((user) => user.id !== event.payload.user.id);

        users = [...nextUsers, event.payload.user];
        roles = event.payload.roles;
        selectedUserId = event.payload.user.id;
        analysis = event.payload.analysis;
        status = "ready";
        message = "Updated immediately from USER_ROLES_UPDATED.";
      }),
      subscribeToDomainEvent("BUS_STATUS_CHANGED", (event) => {
        busEnabled = event.payload.enabled;

        if (event.payload.enabled) {
          status = analysis ? "ready" : "loading";
          message = "Event bus is online again. API remains the source of truth.";
          void rehydrate("Recovered after event bus returned.");
          return;
        }

        status = "degraded";
        message = event.payload.reason ?? "Event bus is unavailable. Falling back to API rehydration.";
        void rehydrate("Event bus degraded.");
      }),
    ];

    void rehydrate("Initial load.");

    return () => cleanup.forEach((unsubscribe) => unsubscribe());
  });
</script>

<aside class="visualizer mfe-stack" aria-live="polite">
  <header class="visualizer__header">
    <div>
      <p class="visualizer__eyebrow">Svelte auxiliary app</p>
      <h2>Permission analysis</h2>
    </div>
    <span class="visualizer__status visualizer__status--{status}">
      {status}
    </span>
  </header>

  <div class="visualizer__notice visualizer__notice--{status}">
    <strong>{busEnabled ? "Hybrid sync active" : "Degraded mode"}</strong>
    <span>{message}</span>
  </div>

  <button class="mfe-button mfe-button--secondary" type="button" onclick={() => rehydrate("Manual rehydrate.")}>
    Rehydrate from API
  </button>

  {#if status === "error"}
    <div class="visualizer__notice visualizer__notice--error">
      <strong>Visualizer could not load authoritative state.</strong>
      <span>Nuxt remains usable; retry when the API is reachable.</span>
    </div>
  {:else if !analysis}
    <p class="visualizer__muted">Waiting for a selected user.</p>
  {:else}
    <section class="visualizer__section">
      <p class="visualizer__label">Selected user</p>
      <h3>{selectedUser?.name ?? analysis.userName}</h3>
      <p class="visualizer__muted">{activeRoleNames}</p>
      <p class="visualizer__muted">{roles.length} roles available from the host API</p>
    </section>

    <section class="visualizer__section">
      <p class="visualizer__label">Effective permissions</p>
      <div class="visualizer__pill-list">
        {#each analysis.permissions as permission}
          <span class="mfe-pill">{permissionLabels[permission]}</span>
        {/each}
      </div>
    </section>

    <section class="visualizer__section">
      <p class="visualizer__label">Warnings and notes</p>
      {#if analysis.findings.length === 0}
        <div class="visualizer__finding visualizer__finding--info">
          <strong>No issues detected</strong>
          <span>The current role set is narrow and explainable.</span>
        </div>
      {:else}
        <div class="visualizer__findings">
          {#each analysis.findings as finding}
            <article class="visualizer__finding visualizer__finding--{finding.severity}">
              <strong>{finding.title}</strong>
              <span>{finding.detail}</span>
            </article>
          {/each}
        </div>
      {/if}
    </section>
  {/if}
</aside>

<style>
  .visualizer {
    color: var(--mfe-color-text);
  }

  .visualizer__header {
    align-items: start;
    display: flex;
    gap: var(--mfe-space-3);
    justify-content: space-between;
  }

  .visualizer__header h2,
  .visualizer__header p,
  .visualizer__section h3,
  .visualizer__section p {
    margin: 0;
  }

  .visualizer__eyebrow,
  .visualizer__label {
    color: var(--mfe-color-info);
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .visualizer__status {
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    padding: 4px 9px;
    text-transform: uppercase;
  }

  .visualizer__status--ready {
    background: var(--mfe-color-success-soft);
    color: var(--mfe-color-success);
  }

  .visualizer__status--loading,
  .visualizer__status--degraded {
    background: var(--mfe-color-warning-soft);
    color: var(--mfe-color-warning);
  }

  .visualizer__status--error {
    background: var(--mfe-color-danger-soft);
    color: var(--mfe-color-danger);
  }

  .visualizer__notice,
  .visualizer__finding,
  .visualizer__section {
    border: 1px solid var(--mfe-color-border);
    border-radius: var(--mfe-radius-md);
    display: grid;
    gap: var(--mfe-space-2);
    padding: var(--mfe-space-3);
  }

  .visualizer__notice--ready,
  .visualizer__finding--info {
    background: var(--mfe-color-info-soft);
    color: var(--mfe-color-info);
  }

  .visualizer__notice--loading,
  .visualizer__notice--degraded,
  .visualizer__finding--warning {
    background: var(--mfe-color-warning-soft);
    color: var(--mfe-color-warning);
  }

  .visualizer__notice--error,
  .visualizer__finding--critical {
    background: var(--mfe-color-danger-soft);
    color: var(--mfe-color-danger);
  }

  .visualizer__muted {
    color: var(--mfe-color-muted);
  }

  .visualizer__pill-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--mfe-space-2);
  }

  .visualizer__findings {
    display: grid;
    gap: var(--mfe-space-2);
  }
</style>
