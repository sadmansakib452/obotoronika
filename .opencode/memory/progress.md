# Progress: obotoronika workspace

Last Updated: 2026-07-10

## Current Status: Phase 2 Connection Verification ✅ Complete

### Completed — Phase 1: Documentation
- [x] **Ch 0.1-0.4**: Full system scan (~140 endpoints, 25+ utils, 53 pages, 95 components, 12 stores, 53 migrations, ~35 RPCs)
- [x] **Ch 1-10**: 29 documentation files in Bengali (pushed to git: `bbb128a`)

### Completed — Phase 2: Connection Verification
- [x] **Ch 1**: Supabase — URL (200), anon key (auth works), service_role key (REST works), core tables (data present), RPCs tested (get_recommendations ✅, fn_get_return_stats ✅, count_by_role ⚠️ permission denied)
- [x] **Ch 2**: Cloudflare — Token VERIFIED ✅, Pages project "obotoronika" connected ✅, production branch set to `main` ✅, GitHub workflows fixed (master→main) ✅, env vars updated ✅
- [x] **Ch 3**: Media Storage — Worker running ✅, R2 bucket exists ✅, upload/serve both work ✅ (previous 500 was test method issue)
- [x] **Ch 4**: SSLCommerz Sandbox — Session created ✅ (store_id working), Gateway URL generated ✅
- [x] **Ch 5**: Email SMTP — Gmail app password works ✅ (test email sent)
- [x] **Ch 6**: Build — Fixed missing `</div>` in `customer/orders/index.vue` ✅, production build passes (17 MB, 3.54 MB gzip)
- [x] **Deploy**: Live at https://obotoronika-l5o.pages.dev ✅ (auto-deploy on push to `main`)
- [x] **Connection Info**: Created `.opencode/memory/connection-info.md` (gitignored, Bengali, all credentials + flow)

### Key Issues Found During Scan
- Auth holes in 5 endpoints (auto-cancel, bandwidth-usage, user-location-summary, has-slug, merchants/:id)
- `checkUserRole` signature inconsistency across handlers (event missing in wishlist)
- Multiple copy-paste error messages (wishlist → cart)
- SQL injection risk in product `filterBy`
- `select('*')` in several endpoints
- No Zod validation in many handlers (manual validation)
- bKash amount hardcoded
- Invoice RPC migration needs `supabase db push`
- ~~Build error in `customer/orders/index.vue:35`~~ ✅ FIXED

### Config Issues Found (Needs Manual Action)
- **Cloudflare API Token** — INVALID, regenerate from Cloudflare Dashboard
- **Cloudflare Zone ID** — might be Account ID, verify in Dashboard
- **GitHub Workflow** — branch targets `master`, change to `main`
- **NuxtHub Workflow** — rename `nuxthub.yml.example` → `nuxthub.yml`
- **Media Worker Upload** — 500 error on POST /api/upload (separate worker code)

### Next: Feature Work or Bug Fixes
- EmptyState component → all dashboard tables
- ConfirmModal component → delete/approve/reject
- Skeleton loaders → analytics, product pages
- Fix auth holes in 5 endpoints
- Fix checkUserRole signature inconsistency
- Fix bKash amount hardcoded
