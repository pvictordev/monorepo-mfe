<script setup lang="ts">
import { RoleIdSchema, type EffectivePermissionsResponse, type PermissionAnalysis, type RoleId, type WorkspaceStateResponse } from "@repo/contracts";
import { publishDomainEvent, setEventBusEnabled } from "@repo/event-bus";
import { permissionLabels } from "@repo/headless";

const { data: workspace, error, refresh } = await useAsyncData<WorkspaceStateResponse>("permission-state", () =>
  $fetch("/api/state"),
);

const selectedUserId = ref("");
const analysis = ref<PermissionAnalysis | null>(null);
const isMutating = ref(false);
const simulateBusFailure = ref(false);
const simulateMountFailure = ref(false);
const busMessage = ref("Event bus is online.");

const selectedUser = computed(() => workspace.value?.users.find((user) => user.id === selectedUserId.value) ?? null);
const selectedRoleIds = computed(() => new Set<RoleId>(selectedUser.value?.roleIds ?? []));

function emitSelectedUser(userId: string) {
  const result = publishDomainEvent({
    type: "USER_SELECTED",
    payload: { userId },
  });

  if (!result.ok) {
    busMessage.value = result.reason ?? "The event bus did not accept USER_SELECTED.";
  }
}

function emitRolesUpdated() {
  if (!selectedUser.value || !workspace.value || !analysis.value) {
    return;
  }

  const result = publishDomainEvent({
    type: "USER_ROLES_UPDATED",
    payload: {
      user: selectedUser.value,
      roles: workspace.value.roles,
      analysis: analysis.value,
    },
  });

  if (!result.ok) {
    busMessage.value = result.reason ?? "The event bus did not accept USER_ROLES_UPDATED.";
  }
}

async function refreshAnalysis(userId = selectedUserId.value) {
  if (!userId) {
    analysis.value = null;
    return;
  }

  const response = await $fetch<EffectivePermissionsResponse>(`/api/users/${encodeURIComponent(userId)}/permissions`);

  analysis.value = response.analysis;
}

function selectUser(userId: string) {
  selectedUserId.value = userId;
  emitSelectedUser(userId);
}

async function toggleRole(roleId: RoleId) {
  if (!selectedUser.value) {
    return;
  }

  isMutating.value = true;

  try {
    const isAssigned = selectedRoleIds.value.has(roleId);
    const response = await $fetch<EffectivePermissionsResponse>(
      isAssigned ? `/api/users/roles?userId=${selectedUser.value.id}&roleId=${roleId}` : "/api/users/roles",
      {
        body: isAssigned ? undefined : { userId: selectedUser.value.id, roleId },
        method: isAssigned ? "DELETE" : "POST",
      },
    );

    analysis.value = response.analysis;
    await refresh();
    emitRolesUpdated();
  } finally {
    isMutating.value = false;
  }
}

function toggleBusFailure() {
  const enabled = !simulateBusFailure.value;
  const result = setEventBusEnabled(enabled, simulateBusFailure.value ? "Demo bus failure toggle" : undefined);

  busMessage.value = result.ok
    ? enabled
      ? "Event bus is online."
      : "Event bus failure is simulated. Svelte should degrade and rehydrate from the API."
    : (result.reason ?? "Could not update event bus state.");
}

watchEffect(() => {
  const firstUser = workspace.value?.users[0];

  if (!selectedUserId.value && firstUser) {
    selectedUserId.value = firstUser.id;
  }
});

watch(
  selectedUserId,
  async (userId) => {
    await refreshAnalysis(userId);

    if (userId) {
      emitSelectedUser(userId);
    }
  },
  { immediate: true },
);

onMounted(() => {
  toggleBusFailure();
});
</script>

<template>
  <main class="host-shell">
    <header class="host-topbar">
      <div class="host-title">
        <p class="host-eyebrow">Nuxt host owns API and workflow</p>
        <h1>User role management + permission visualizer</h1>
        <p class="host-muted">A compact multi-framework microfrontend demo with an optional Svelte analysis panel.</p>
      </div>

      <div class="host-toolbar">
        <label class="host-toggle">
          <input v-model="simulateBusFailure" type="checkbox" @change="toggleBusFailure" />
          Simulate bus failure
        </label>
        <label class="host-toggle">
          <input v-model="simulateMountFailure" type="checkbox" />
          Simulate widget mount failure
        </label>
      </div>
    </header>

    <p
      class="host-alert"
      :class="simulateBusFailure ? 'host-alert--warning' : 'host-alert--success'"
    >
      {{ busMessage }}
    </p>

    <section v-if="error" class="host-alert host-alert--danger">
      Could not load the workspace state: {{ error.message }}
    </section>

    <section v-else class="host-layout">
      <div class="host-main">
        <section class="host-section mfe-surface">
          <div class="host-section-header">
            <div>
              <h2>Users</h2>
              <p class="host-muted">Select the account whose roles should drive the visualizer.</p>
            </div>
          </div>

          <div class="host-user-grid">
            <button
              v-for="user in workspace?.users"
              :key="user.id"
              class="host-user-card"
              type="button"
              :aria-pressed="user.id === selectedUserId"
              @click="selectUser(user.id)"
            >
              <strong>{{ user.name }}</strong>
              <span class="host-muted">{{ user.email }}</span>
              <span class="mfe-pill">{{ user.roleIds.length }} roles</span>
            </button>
          </div>
        </section>

        <section class="host-section mfe-surface">
          <div class="host-section-header">
            <div>
              <h2>Available roles</h2>
              <p class="host-muted">Nuxt persists assignments in its server-side store and emits validated events.</p>
            </div>
            <span v-if="selectedUser" class="mfe-pill">Editing {{ selectedUser.name }}</span>
          </div>

          <div class="host-role-grid">
            <article
              v-for="role in workspace?.roles"
              :key="role.id"
              class="host-role-card"
              :class="{ 'host-role-card--assigned': selectedRoleIds.has(role.id) }"
            >
              <div>
                <h3>{{ role.name }}</h3>
                <p class="host-muted">{{ role.description }}</p>
                <div class="host-permission-list">
                  <span v-for="permission in role.permissions" :key="permission" class="mfe-pill">
                    {{ permissionLabels[permission] }}
                  </span>
                </div>
              </div>

              <div class="host-role-actions">
                <button
                  class="mfe-button"
                  :class="selectedRoleIds.has(role.id) ? 'mfe-button--danger' : 'mfe-button--primary'"
                  type="button"
                  :disabled="isMutating || !selectedUser || !RoleIdSchema.safeParse(role.id).success"
                  @click="toggleRole(role.id)"
                >
                  {{ selectedRoleIds.has(role.id) ? "Remove" : "Assign" }}
                </button>
              </div>
            </article>
          </div>
        </section>

        <section v-if="analysis" class="host-section mfe-surface">
          <div class="host-section-header">
            <div>
              <h2>Host-side API result</h2>
              <p class="host-muted">The host and the Svelte widget consume the same permission contracts.</p>
            </div>
          </div>

          <div class="host-permission-list">
            <span v-for="permission in analysis.permissions" :key="permission" class="mfe-pill">
              {{ permissionLabels[permission] }}
            </span>
          </div>
        </section>
      </div>

      <ClientOnly>
        <SveltePermissionVisualizer
          :key="selectedUserId"
          :selected-user-id="selectedUserId"
          :simulate-mount-failure="simulateMountFailure"
        />
      </ClientOnly>
    </section>
  </main>
</template>
