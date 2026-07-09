# API 02: Products / Catalog (18 Endpoints)

## Public (7)

| Method | Path | কী করে | Zod |
|--------|------|--------|-----|
| GET | `/api/products` | পাবলিশড প্রোডাক্ট লিস্ট (paginated + search + filter) | `querySchema` |
| GET | `/api/products/featured` | ফিচার্ড প্রোডাক্ট | `querySchema` |
| GET | `/api/products/search` | কুইক সার্চ (max 20) | `querySchema` |
| GET | `/api/products/[slug]` | সিঙ্গেল প্রোডাক্ট | ❌ None |
| GET | `/api/products/[slug]/recommendations` | রিকমেন্ডেশন | ❌ None |
| GET | `/api/products/sections` | সব সেকশন + প্রোডাক্ট | ❌ None |
| GET | `/api/products/sections/[slug]` | সেকশন/ক্যাটেগরি অনুযায়ী প্রোডাক্ট | `querySchema` |

## Authenticated — Cart (6)

| Method | Path | কী করে | Zod |
|--------|------|--------|-----|
| GET | `/api/products/cart` | ইউজারের কার্ট (split: available/unavailable) | ❌ None |
| POST | `/api/products/cart` | প্রোডাক্ট যোগ (upsert) | `cartSchema` |
| PATCH | `/api/products/cart/[id]` | কোয়ান্টিটি আপডেট | ❌ Manual only |
| DELETE | `/api/products/cart/[id]` | আইটেম রিমুভ | ❌ None |
| POST | `/api/products/cart/delete-many` | বাল্ক ডিলিট | inline Zod |
| GET | `/api/products/cart/count` | টোটাল কার্ট আইটেম (RPC) | ❌ None |

## Authenticated — Wishlist (5)

| Method | Path | কী করে | Zod |
|--------|------|--------|-----|
| GET | `/api/products/wishlist` | সব উইশলিস্ট আইডি | ❌ None |
| POST | `/api/products/wishlist` | উইশলিস্টে যোগ | `wishlistSchema` |
| DELETE | `/api/products/wishlist` | রিমুভ (query param) | `wishlistSchema` |
| GET | `/api/products/wishlist/count` | টোটাল কাউন্ট | ❌ None |
| GET | `/api/products/wishlist/products` | পণ্য ডেটা সহ লিস্ট (paginated) | `wishlistQuerySchema` |

## Issues

- **checkUserRole signature inconsistent** — wishlist handlers call `checkUserRole(supabase, [...])` without `event` (cart handlers use `checkUserRole(event, supabase, [...])`)
- **Copy-paste errors** — cart delete handler says "Failed to remove product from **wishlist**"
- **SQL injection risk** — `filterBy` in `index.get.ts` uses `.eq(filterBy, true)` with no whitelist
- **select('*')** — `[slug]/index.get.ts` uses `select('*')`
