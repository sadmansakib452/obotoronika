# Project Knowledge: web-obotoronika

## Overview
Full-stack e-commerce platform built with Nuxt 3 + Supabase + SSLCommerz (Bangladeshi payment). Multi-vendor marketplace supporting merchants, sellers, and customers.

## Tech Stack
- **Framework:** Nuxt 3.15.4 (compatibilityVersion 4) + Nitro 2.10.4
- **UI:** @nuxt/ui v2.21.0 (ui.global: false → explicit imports from #components)
- **Auth:** @nuxtjs/supabase 1.4.6 (PKCE flow, useSsrCookies: true)
- **State:** Pinia via @pinia/nuxt (stores auto-imported from app/stores/)
- **Styling:** Tailwind CSS via @nuxtjs/tailwindcss, custom CSS at app/assets/styles/main.css
- **Validation:** Zod (shared between client + server)
- **Hosting:** NuxtHub / Cloudflare Pages (edge-ready)
- **Payment:** SSLCommerz (client in server/ssl/, helpers in server/ssl/api/)
- **Database:** Supabase PostgreSQL + service_role admin client (supabaseAdmin)
- **Image storage:** External Express API at media.obotoronika.com

## Key Patterns

### API Handler Template (5-step)
```typescript
1. Auth & role check (getServerSupabase + checkUserRole)
2. Parse & validate input (getQuery / readBody / getRouterParam + Zod)
3. Business logic (supabaseAdmin.rpc() or supabaseAdmin.from().select())
4. Envelope response (successResponse / errorResponse)
5. Error cascade (401 → 403 → business errors → 500)
```

### Response Envelope
- Success: `{ success: true, status, message, data: { data, meta? } }`
- Error: `{ success: false, status, error, message }`
- Meta for list endpoints: `{ total, page, perPage, totalPages }`

### Auth & Roles
- Roles: super_admin, admin, manager, customer, seller
- Admin write ops always use supabaseAdmin (service_role, bypasses RLS)
- supabaseAdmin is DEFAULT export from ~~/server/utils/supabaseAdmin

### Database
- 53 Supabase SQL migrations (YYYYMMDDHHMMSS naming, rollback required)
- Business logic in PostgreSQL RPC functions (SECURITY DEFINER for auth.users access)
- Paginated list pattern: get_*_list + get_*_count (limit/offset)
- Merchant hierarchy: orders → merchant_orders → order_items
- Related: transactions, invoices, refunds

### Routing
- server/api/ → /api/ prefix (e.g., /api/dashboard/finance/refunds)
- server/routes/ → root-level (e.g., /docs, /payment/success)
- Method suffixes: .get.ts, .post.ts, .patch.ts, .delete.ts
- Dynamic params: [param] folder syntax

### Pinia Store Pattern
```typescript
state: { isLoading, data: Record<string, any[]>, pagination: { page, perPage, total, totalPages } }
```
Cache key pattern: getPageKey(page, perPage, search, filter) → data[pageKey]

## Directory Structure
```
shared/types/           → Shared TS types
shared/utils/           → Slugify, validation, form helpers
shared/validators/      → Zod request validators
server/api/             → 21 API modules (auth, dashboard, orders, products, etc.)
server/utils/           → Auto-imported server utilities
server/database/        → Zod schema-validator.ts
server/docs/            → OpenAPI 3.1 spec + registry
server/ssl/             → SSLCommerz payment integration
server/middleware/      → bandwidthTracker.global.ts
app/pages/              → 19 page directories
app/components/         → Vue components (dashboard, customer, ui, etc.)
app/stores/             → 11 Pinia stores
app/composables/        → 8 composables (useAuth, useCart, etc.)
app/middleware/         → Client-side route middleware
supabase/migrations/    → 53 SQL migrations
```

## External Services
- SSLCommerz (Bangladeshi payment gateway)
- Supabase (PostgreSQL database)
- Resend (transactional emails)
- Cloudflare API (CDN, analytics)
- MaxMind GeoIP
- media.obotoronika.com (image storage)
