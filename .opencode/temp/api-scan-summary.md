# API Endpoint Scan - Complete Summary

## Grand Total: ~140 endpoints

## Module Breakdown

### auth/ — 10 endpoints
1. POST /api/auth/verify-identifier — send OTP
2. POST /api/auth/verify — verify OTP
3. POST /api/auth/signup — register new user
4. POST /api/auth/signin — login (no Zod validation)
5. POST /api/auth/post-login — post-login callback (NuxtHub edge)
6. DELETE /api/auth/logout — sign out (doesn't delete session record)
7. POST /api/auth/forgot-password — send reset OTP
8. POST /api/auth/reset-password — complete reset
9. GET /api/auth/sessions — list sessions (potential bug: no user_id filter)
10. DELETE /api/auth/sessions/[id] — delete session (no ownership check)

### products/ — 18 endpoints
Public (7): GET /products, GET /featured, GET /search, GET /:slug, GET /:slug/recommendations, GET /sections, GET /sections/:slug
Auth (11): GET /cart, POST /cart, GET /cart/count, POST /cart/delete-many, DELETE /cart/:id, PATCH /cart/:id, GET /wishlist, POST /wishlist, DELETE /wishlist, GET /wishlist/count, GET /wishlist/products

Issues: checkUserRole signature inconsistency (wishlist missing event), copy-paste errors in error messages, select('*') in slug endpoint, SQL injection risk in filterBy

### orders/ — 16 endpoints
1. GET /orders — list (paginated)
2. POST /orders — create (with stock rollback)
3. PATCH /orders/checkout — complete checkout
4. GET /orders/counts — counts by status
5-9. GET /orders/{cancelled,processing,shipped,delivered,returned} — status filters
10. GET /orders/auto-cancel — cron (NO AUTH!)
11. GET /orders/[id] — single order
12. POST /orders/[id]/cancel — cancellation request
13. GET /orders/[id]/cancel-status — check cancel status
14. POST /orders/[id]/refund — refund request
15. GET /orders/[id]/refund-status — check refund status
16. GET /orders/[id]/update-status — admin set awaiting_payment (GET for mutation!)

### payment/ — 2 endpoints
1. POST /api/payment/ipn — SSLCommerz webhook (public)
2. GET /api/payment — initiate payment session

### refunds/ — 3 endpoints
1. GET /api/refunds/status — check SSLCommerz refund status
2. GET /api/refunds/[id] — get refund details
3. POST /api/refunds/[id]/process — admin process refund

### returns/ — 4 endpoints
1. POST /api/returns — create return/cancellation request
2. GET /api/returns — list user's returns
3. GET /api/returns/[id] — get return detail
4. POST /api/returns/[id]/withdraw — withdraw return

### dashboard/ — ~62 endpoints
- banners: 4 (CRUD)
- analytics: 4 (admin, bandwidth-usage NO AUTH!, cloudflare, user-location-summary NO AUTH!)
- categories: 7 (list, create, bulk-delete, get :id, update :id, delete :id, undo-delete)
- merchants: 5 (list, create, update :id, delete :id, undo-delete)
- orders: 4 (list, create, get :id, update :id)
- products: 8 (list, create, has-slug NO AUTH!, save, get :id, update :id, save-draft :id, delete :id)
- variants: 6 (list, create, product-variants, get :id, create-value :id, delete :id)
- variant options: 3 (get :id, update :id, delete :id)
- returns: 5 (list, get :id, approve, reject, mark-received)
- sections: 4 (list, create, manage, delete :id)
- users: 6 (list, create, get :id, update :id, delete :id, get :id/addresses)
- settings/website/general: 2 (get, post)
- finance/refunds: 3 (list, get :id, update :id)
- finance/transactions: 1 (list)

### profiles/ — 11 endpoints
1. GET /api/profile
2. PATCH /api/profile
3. GET /api/profiles/[id]
4. GET /api/profiles/addresses
5. GET /api/profiles/addresses/default
6. POST /api/profiles/addresses
7. PATCH /api/profiles/addresses/[id]/save
8. PATCH /api/profiles/addresses/[id]
9. DELETE /api/profiles/addresses/[id]
10. PATCH /api/profiles/addresses/[id]/default
11. GET /api/shipping

### reviews/ — 4 endpoints
1. GET /api/reviews — list user reviews
2. GET /api/reviews/[id]/[product_id] — single review context
3. POST /api/reviews/submit — submit review
4. GET /api/reviews/to-reviews — reviewable products (paginated)

### geo/ — 2 endpoints
1. GET /api/geo/ip — geolocation (public)
2. GET /api/geo/bangladesh — redirect to GeoJSON (public)

### merchants/ — 1 endpoint
1. GET /api/merchants/[id] — public merchant detail (NO AUTH, select('*'))

### banners/ — 1 endpoint
1. GET /api/banners — public active banners

### menus/ — 1 endpoint
1. GET /api/menus — public hierarchical menu

### misc/ — 5 endpoints
1. GET /api/ping — health check
2. GET /api/create-admin — dev bootstrap (env-gated)
3. POST /api/visitor-log — visitor tracking (public)
4. GET /api/docs/openapi — OpenAPI spec (env-gated)
5. GET /api/fake/products — generate fake products (dev tool)

## Key Issues Found
1. Auth holes: auto-cancel, bandwidth-usage, user-location-summary, has-slug have no auth
2. checkUserRole signature inconsistency across handlers
3. Multiple copy-paste error messages
4. select('*') in several endpoints
5. SQL injection risk in product filterBy
6. No Zod in many handlers (manual validation)
7. Several public endpoints use supabaseAdmin (service_role)
