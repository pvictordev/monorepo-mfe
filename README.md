# Frontend Platform Monorepo

This monorepo now uses:

- `apps/web`: Nuxt 3 with SSR and Nitro server routes
- `apps/docs`: Svelte SPA powered by Vite and client-side routing
- `packages/shared`: shared API, auth, env, route, and type helpers
- `packages/eslint-config`: shared ESLint presets for base, React, Vue, and Svelte code
- `packages/typescript-config`: shared TypeScript baselines

## Before

```text
apps/
  web/   -> Next.js
  docs/  -> Next.js
packages/
  ui/
  eslint-config/
  typescript-config/
```

## After

```text
apps/
  web/   -> Nuxt 3 SSR app
  docs/  -> Svelte SPA
packages/
  shared/
  ui/
  eslint-config/
  typescript-config/
```

## Commands

```sh
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm check-types
pnpm test
```

## Environment mapping

Keep your existing `.env` files and translate public variables as needed:

- Nuxt public values: `NUXT_PUBLIC_*`
- Svelte public values: `VITE_PUBLIC_*`
- Nuxt server-only values: `NUXT_*` without the `PUBLIC` segment

Shared defaults are resolved in `packages/shared/src/env.ts`.

## Deployment notes

- The Nuxt app owns the server runtime and can absorb former Next.js API routes under `apps/web/server/api`.
- The Svelte app is an SPA and proxies `/api` to Nuxt during local development to keep auth cookies and CORS behavior aligned.
- CI is wired through `.github/workflows/ci.yml`.
