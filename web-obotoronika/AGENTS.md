# AGENTS.md - Obotoronika E-commerce

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on http://localhost:3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run deploy` | Deploy to Cloudflare via NuxtHub |

## Database

| Command | Description |
|---------|-------------|
| `npm run db:start` | Start local Supabase (Docker) |
| `npm run db:stop` | Stop local Supabase |
| `npm run db:sync` | Push schema to remote Supabase |
| `npm run db:push` | Push Drizzle schema |
| `npm run generate` | Generate Drizzle types |
| `npm run migration:new` | Create new Supabase migration |

## Tech Stack

- **Framework**: Nuxt 3 + NuxtHub (Cloudflare edge)
- **UI**: Nuxt UI + TailwindCSS + shadcn-nuxt
- **Auth**: Supabase (SSR cookies + PKCE flow)
- **State**: Pinia
- **Database**: Supabase (PostgreSQL) + Drizzle ORM

## Architecture

- `app/` - Frontend (pages, components, stores, composables)
- `server/api/` - Server API routes
- `server/utils/` - Shared server utilities
- `app/stores/` - Pinia stores (auto-imported)

## Key Config Notes

- Supabase auth uses SSR cookies with PKCE - token stored in custom storage key derived from project ref
- Dev server allows `obotoronika.ddns.net` hosts (nuxt.config.ts:107-112)
- Environment variables: `.env` (not committed), `.env.example` for template
- Single quotes enforced in ESLint (eslint.config.mjs:6)

## Supabase Auth Exclusions

These routes bypass auth redirect: `/`, `/auth/callback`, `/auth/login`, `/auth/signup`, `/order-received`, `/fail`, `/cancel`, `/checkout/payment-method`