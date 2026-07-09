# API Module Summary

**Total Endpoints: ~140** (21 modules)

## Module Table

| # | Module | Endpoints | Auth Required | Public | Status |
|---|--------|-----------|---------------|--------|--------|
| 1 | **auth/** | 10 | 7 Yes / 3 No | verify-identifier, verify, signup, forgot, reset | ✅ Complete |
| 2 | **products/** | 18 | 11 Yes / 7 No | list, search, detail, sections, recommendations | ✅ Complete |
| 3 | **orders/** | 16 | 15 Yes / 1 No (auto-cancel) | — | ✅ Complete |
| 4 | **payment/** | 2 | None (public webhook) | Both | ✅ Complete |
| 5 | **refunds/** | 3 | 3 Yes | — | ✅ Complete |
| 6 | **returns/** | 4 | 4 Yes | — | ✅ Complete |
| 7 | **dashboard/** | ~62 | ~58 Yes / 4 No (auth holes) | — | ✅ Complete |
| 8 | **profiles/** | 11 | 11 Yes | — | ✅ Complete |
| 9 | **reviews/** | 4 | 4 Yes | — | ✅ Complete |
| 10 | **geo/** | 2 | None | Both | ✅ Complete |
| 11 | **merchants/** | 1 | None | Yes | ✅ Complete |
| 12 | **banners/** | 1 | None | Yes | ✅ Complete |
| 13 | **menus/** | 1 | None | Yes | ✅ Complete |
| 14 | **misc** | 5 | 1 Yes / 4 No | ping, create-admin, docs, visitor-log | ✅ Complete |

## Auth Holes (Potential Issues)

| Endpoint | Issue |
|----------|-------|
| `GET /api/orders/auto-cancel` | No auth — publicly accessible cron endpoint |
| `GET /api/dashboard/analytics/bandwidth-usage` | No auth — should be admin-only |
| `GET /api/dashboard/analytics/user-location-summary` | No auth — should be admin-only |
| `GET /api/dashboard/products/has-slug` | No auth — slug existence check, low risk |
| `GET /api/merchants/[id]` | No auth, `select('*')` — public merchant detail |
| `POST /api/payment/ipn` | Public webhook (by design) |

## API File Convention

```typescript
// Method from filename suffix:
products/index.get.ts    → GET    /api/products
products/index.post.ts   → POST   /api/products
products/[slug]/index.get.ts → GET /api/products/:slug

// Response envelope:
successResponse(event, 200, data)
errorResponse(event, 400, 'message')

// Auth:
checkUserRole(event, supabase, ['admin', 'super_admin'])
```

## Detailed Module Docs

| Doc | Module |
|-----|--------|
| [01-auth.md](./01-auth.md) | Authentication |
| [02-products.md](./02-products.md) | Products / Catalog |
| [03-orders.md](./03-orders.md) | Orders |
| [04-payment.md](./04-payment.md) | SSLCommerz Payment |
| [05-dashboard.md](./05-dashboard.md) | Admin Dashboard |
| [06-refunds-returns.md](./06-refunds-returns.md) | Refunds & Returns |
| [07-profiles-shipping.md](./07-profiles-shipping.md) | Profiles & Shipping |
| [08-reviews-banners-geo.md](./08-reviews-banners-geo.md) | Reviews, Banners, Geo, Misc |
| [09-other.md](./09-other.md) | Other (Ping, Create Admin, Visitor Log, Docs, Fake) |
