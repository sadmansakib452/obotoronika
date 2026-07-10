# Progress: obotoronika workspace

Last Updated: 2026-07-10

## Current Status: ProductForm Refactoring (Ch 1-3) ✅ Complete

### Completed — Phase 1: Documentation
- [x] **Ch 0.1-0.4**: Full system scan
- [x] **Ch 1-10**: 29 documentation files in Bengali

### Completed — Phase 2: Connection Verification
- [x] **Ch 1-6**: Supabase, Cloudflare, Media, SSLCommerz, Email, Build all verified
- [x] **Deploy**: Live at https://obotoronika-l5o.pages.dev

### Completed — Phase 3: Product Create Page Refactoring
- [x] **Ch 1 (Validation)**: Fixed `cost_price` error msg, `z.coerce.number()` for all number fields, renamed `thumbnailRequired`→`hasExistingThumbnail`
- [x] **Ch 2 (Loading states)**: Removed `await` from `useFetch`, added `isPageLoading`/`isPageError` computeds, skeleton UI, error state with Retry, `<fieldset :disabled>` during submit
- [x] **Ch 3 (Image upload)**: Created `ImageUploader.vue` with drag-and-drop, file validation (type + size 5MB), preview grid with hover-to-delete; removed 7 inline state vars + CSS from ProductForm.vue
- [x] **Build fix**: Removed duplicate `watch(secData)`, fixed missing `}` in `removeLocation()` — brace balance restored
- [x] **Bug fix (categories)**: `fetchedCategories` changed from plain var to `ComputedRef` → `categories` computed was accessing `ComputedRef.data` (undefined) instead of `.value.data` — fixed with `.value?.data?.categories?.map(...)`
- [x] **Bug fix (fallback)**: `fetchedCategories` fallback `{ categories: [] }` → `{ data: { categories: [] } }` to match `SuccessResponse` structure

### Key Issues Found During Scan
- Auth holes in 5 endpoints (auto-cancel, bandwidth-usage, user-location-summary, has-slug, merchants/:id)
- `checkUserRole` signature inconsistency across handlers (event missing in wishlist)
- Multiple copy-paste error messages (wishlist → cart)
- SQL injection risk in product `filterBy`
- `select('*')` in several endpoints
- No Zod validation in many handlers (manual validation)
- bKash amount hardcoded
- Invoice RPC migration needs `supabase db push`

### Config Issues Found (Needs Manual Action)
- **Cloudflare API Token** — INVALID, regenerate from Cloudflare Dashboard
- **Cloudflare Zone ID** — might be Account ID, verify in Dashboard
- **GitHub Workflow** — branch targets `master`, change to `main`
- **NuxtHub Workflow** — rename `nuxthub.yml.example` → `nuxthub.yml`
- **Media Worker Upload** — 500 error on POST /api/upload (separate worker code)

### Next: Feature Work or Bug Fixes
- EmptyState component → all dashboard tables
- ConfirmModal component → delete/approve/reject
- Fix auth holes in 5 endpoints (auto-cancel, bandwidth-usage, user-location-summary, has-slug, merchants/:id)
- Fix checkUserRole signature inconsistency
- Fix bKash amount hardcoded
