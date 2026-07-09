# Database 03: RPC Functions (~35)

## Business Logic RPCs

| Function | Parameters | Purpose |
|----------|-----------|---------|
| `create_transaction_and_invoices` | `p_order_id`, `p_total_amount`, `p_payment_method`, `p_items JSONB` | Atomic: transaction + per-merchant invoices তৈরি |
| `cancel_order_and_restore_stock` | `p_order_id BIGINT` | Order cancel + stock restore (pending/processing/awaiting_payment) |
| `get_recommendations` | `p_slug`, `p_limit` | Product recommendations |
| `count_total_cart_items` | `p_user_id UUID` | Cart item count |

## Paginated List RPCs

| Function | Parameters | Purpose |
|----------|-----------|---------|
| `get_reviewable_products_paginated` | `_user_id`, `_limit`, `_offset` | Products user can still review |
| `count_reviewable_products` | `_user_id` | Count for pagination |
| `get_refunds_list` | `p_search`, `p_status`, `p_limit`, `p_offset` | Refund list (joins: customer, order, transaction) |
| `get_refunds_count` | `p_search`, `p_status` | Refund count |
| `get_merchant_order_details` | `p_order_id TEXT`, `p_merchant_id INT` | Single merchant order with items |
| `get_merchant_transactions` | Pagination + filter | Merchant transaction list |
| `get_merchant_transactions_count` | Filter | Transaction count |
| `get_invoices_by_merchant` | Pagination + filter | Invoice list |
| `get_transaction_details` | ID | Single transaction detail |
| `get_invoice_details_by_id` | `p_invoice_id TEXT` | Invoice with items + merchant |

## Helper/Validation RPCs

| Function | Parameters | Purpose |
|----------|-----------|---------|
| `fn_can_cancel_order` | `p_order_id` | Check cancel eligibility |
| `fn_can_return_order` | `p_order_id` | Check return eligibility |
| `fn_get_refundable_orders` | Multiple | List refundable orders |
| `fn_calculate_refund_amount` | Multiple | Pro-rata refund calc + fees |
| `fn_get_original_transaction` | `p_order_id` | Original payment transaction |
| `fn_get_return_stats` | None | Return/refund statistics |

## Analytics RPCs

| Function | Parameters | Purpose |
|----------|-----------|---------|
| `count_by_role` | None | User count by role |
| `role_counts_last_7_days` | None | New users/day for 7 days |
| `get_bandwidth_last_n_days` | `p_days` | Bandwidth usage stats |
| `get_city_counts_range` | `days_ago` | User city distribution |

## Admin Function RPCs

| Function | Parameters | Purpose |
|----------|-----------|---------|
| `soft_delete_category` | `p_id` | Soft delete category |
| `undo_delete_category` | `p_id` | Restore category |
| `bulk_delete_categories` | `p_ids INT[]` | Bulk soft delete |
| `delete_all_soft_deleted_categories` | None | Purge soft-deleted |
| `soft_delete_merchant` | `p_id` | Soft delete merchant |
| `undo_delete_merchant` | `p_id` | Restore merchant |
| `delete_all_soft_deleted_merchants` | None | Purge soft-deleted |

## Trigger Functions

| Function | Table | Action |
|----------|-------|--------|
| `update_updated_at()` | Multiple | Auto-set `updated_at` |
| `update_updated_at_column()` | Multiple | Same, newer version |

## Security Pattern

```sql
CREATE OR REPLACE FUNCTION get_refunds_list(...)
RETURNS TABLE (...)
LANGUAGE plpgsql
SECURITY DEFINER  -- ← auth.users পড়তে পারে
AS $$
  -- explicit ::TEXT casts needed for Supabase strict mode
$$;
```

**SECURITY DEFINER** প্রয়োজন কারণ RPC ফাংশনগুলো `auth.users` টেবিল পড়ে (যেটা শুধু superadmin দেখতে পারে)। পরে `20260603000000` migration-এ `::TEXT` casts যোগ করা হয়েছে PostgreSQL strict mode-এর জন্য।
