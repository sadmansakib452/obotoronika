# API 08: Reviews, Banners, Geo, Misc (12 Endpoints)

## Reviews (4)

| Method | Path | কী করে | Zod |
|--------|------|--------|-----|
| GET | `/api/reviews` | ইউজারের রিভিউ (view থেকে) | ❌ None |
| GET | `/api/reviews/[id]/[product_id]` | Order item detail for review | ❌ None |
| POST | `/api/reviews/submit` | রিভিউ সাবমিট | `ratingSchema` |
| GET | `/api/reviews/to-reviews` | রিভিউযোগ্য প্রোডাক্ট (paginated, RPC) | `toReviewsSchema` |

**Issues:**
- `index.get.ts` — silently swallows DB errors (returns `200 []`)
- `[id]/[product_id]/index.get.ts` — ownership check নেই (যে কোন user any order_item দেখতে পারে)

## Banners (1 — Public)

| Method | Path | কী করে |
|--------|------|--------|
| GET | `/api/banners` | একটিভ ব্যানার (joined sections) — পাবলিক |

## Menus (1 — Public)

| Method | Path | কী করে |
|--------|------|--------|
| GET | `/api/menus` | হায়ারার্কিক্যাল ক্যাটেগরি মেনু — পাবলিক |

## Merchants (1 — Public)

| Method | Path | কী করে |
|--------|------|--------|
| GET | `/api/merchants/[id]` | মার্চেন্ট ডিটেল (select('*') !) — পাবলিক |

## Geo (2 — Public)

| Method | Path | কী করে |
|--------|------|--------|
| GET | `/api/geo/ip` | IP জিওলোকেশন (ipwho.is) |
| GET | `/api/geo/bangladesh` | 301 redirect → Bangladesh GeoJSON (CDN) |
