# Role-Based Access Control Microfrontend Demo

Monorepo showcasing microfrontend architecture for user role management and permission visualization.

The apps are:

- `apps/nuxt-host`: Nuxt 3 host, API owner, and authoritative workflow.
- `apps/svelte-visualizer`: Svelte/Vite auxiliary permission visualizer, exposed as a federated remote and runnable alone.

## Repo Structure

```text
apps/
  nuxt-host/          Nuxt 3 host UI, Nitro API routes, in-memory server state
  svelte-visualizer/  Independent Svelte visualizer app and federated widget
packages/
  contracts/          Zod schemas, inferred TypeScript types, API DTOs, event contracts
  headless/           Pure permission analysis logic
  design-system/      Shared CSS tokens and lightweight UI conventions
  event-bus/          Browser event adapter with runtime validation and failure simulation
  sdk/                Typed API client that validates responses with Zod
  eslint-config/      Shared ESLint presets
  typescript-config/  Shared TypeScript baselines
tooling/
  eslint/             Tooling boundary notes
  tsconfig/           Tooling boundary notes
```

## Run It

```sh
pnpm install
pnpm dev
```

Then open:

- Nuxt host: `http://localhost:3010`
- Svelte visualizer standalone: `http://localhost:3012`

Useful checks:

```sh
pnpm check-types:role-demo
pnpm turbo run lint --filter=nuxt-host --filter=svelte-visualizer --filter=@repo/contracts --filter=@repo/headless --filter=@repo/design-system --filter=@repo/event-bus --filter=@repo/sdk
pnpm turbo run build --filter=nuxt-host --filter=svelte-visualizer
```

## Architecture

- The Nuxt app owns users, roles, role assignment/removal, persistence, and API routes.
- The Svelte app owns visualization and risk explanation only. It does not mutate role assignments.
- The apps do not import each other. The host loads the Svelte app through a federated `remoteEntry.js`.
- Shared packages contain only framework-neutral contracts, analysis logic, CSS tokens, event transport, and API access.

This split is useful because role assignment is core workflow and belongs with the API owner, while permission analysis can evolve independently into a richer sidebar, embeddable widget, or operational console.

## Communication Model

The API is the source of truth. Events are only a fast sync path.

Initial and recovery flow:

1. Svelte mounts and fetches `/api/state`.
2. Svelte fetches `/api/users/:id/permissions` for the selected user.
3. Nuxt emits validated browser events such as `USER_SELECTED` and `USER_ROLES_UPDATED`.
4. Svelte updates immediately from events when available.
5. If the event bus is unavailable, Svelte enters degraded mode and rehydrates from the Nuxt API.

## Fault Tolerance

The host page has two visible demo toggles:

- **Simulate bus failure** disables the event bus through `@repo/event-bus`. Nuxt still updates roles through the API, and Svelte shows degraded mode with an API rehydrate path.
- **Simulate widget mount failure** prevents the Svelte remote from mounting. Nuxt keeps the full user/role workflow usable and displays an optional-widget failure message.

Svelte also has a manual **Rehydrate from API** button so recovery is visible during demos.

## Contracts and Validation

`packages/contracts` defines Zod schemas and inferred types for:

- users, roles, permissions
- role assignment requests
- effective permission responses
- workspace state responses
- domain event payloads

Validation is applied at the boundaries:

- Nuxt API validates incoming role assignment payloads and outgoing DTOs.
- The event bus validates event payloads before dispatch.
- The SDK validates API responses before Svelte consumes them.

## Shared Logic and Design

`packages/headless` contains pure TypeScript functions for:

- resolving effective permissions
- detecting redundant roles
- detecting role conflicts
- detecting missing recommended permission groups
- detecting over-privilege
- building visualizer-ready analysis output

`packages/design-system` shares CSS variables and primitive style conventions only. There are no cross-framework components, keeping Vue/Nuxt and Svelte concerns separate.

## Demo Domain

Seeded roles:

- `admin`: broad access, including high-sensitivity permissions
- `editor`: user/report editing without publish access
- `viewer`: read-only access
- `billing`: invoice and billing operations without report context

Example findings:

- `admin + viewer` is redundant
- `editor + viewer` overlaps
- `billing + editor` needs review
- `billing` without `read_reports` gets a missing recommended permission note
- three or more high-sensitivity permissions triggers an over-privilege warning
