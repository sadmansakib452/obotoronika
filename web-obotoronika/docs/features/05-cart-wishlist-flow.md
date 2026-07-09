# Feature 05: Cart & Wishlist Flow

## Cart

```
Add to Cart:
  POST /api/products/cart
    body: { product_id, quantity, variants }

  → Check for existing item (same product_id + same variants)
  → If exists: increment quantity
  → If new: insert new row
  → Returns: 201 (created) / 200 (updated)

View Cart:
  GET /api/products/cart
  → Fetch all cart_items (joined product data)
  → Split into: products (in-stock) + unavailable (stock=0)

Update Quantity:
  PATCH /api/products/cart/[id]
    body: { quantity }

Remove:
  DELETE /api/products/cart/[id]       → Single
  POST /api/products/cart/delete-many  → Bulk
    body: { product_ids: [...] }

Count:
  GET /api/products/cart/count
  → RPC: count_total_cart_items(p_user_id)
  → Returns: { total: N }
  → Note: unauthenticated → returns { total: 0 } (not 401)
```

## Wishlist

```
Add:
  POST /api/products/wishlist
    body: { product_id }  ← UUID

  → Check: duplicate? → 400 if exists
  → Insert: wishlist_items

Remove:
  DELETE /api/products/wishlist?product_id=xxx
  → Uses query param (not body)

View (IDs only):
  GET /api/products/wishlist

View (with product data, paginated):
  GET /api/products/wishlist/products?page=1&perPage=10

Count:
  GET /api/products/wishlist/count
  → Same pattern as cart count (unauthenticated → { total: 0 })
```

## Cart/Wishlist Cache Pattern (Pinia)

```typescript
// Stores use page-key caching:
const pageKey = `${page}-${perPage}`
if (data[pageKey]) return data[pageKey]  // cached

// Separate arrays for cart:
data: {
  products: [...],      // in-stock items
  unavailable: [...]    // out-of-stock items
}
```

## Pending Action After Login

`usePendingActionAfterLogin` — user যদি login না করে cart-এ product add করতে চায়:
1. Login modal দেখা যায়
2. Action `sessionStorage`-এ সেভ হয়
3. Login complete হলে → action auto-execute

## Issues

- **Cart** `PATCH /api/products/cart/[id]` — manual validation instead of Zod
- **Cart** `DELETE /api/products/cart/[id]` — error message says `wishlist` (copy-paste bug)
- **Wishlist** `checkUserRole` — missing `event` parameter (signature inconsistency)
- **Cart** POST handler — variant keys must be in same order (fragile JSON.stringify)
