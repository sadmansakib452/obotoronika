# Database 02: Migrations (53 Total)

## Naming Convention

`YYYYMMDDHHMMSS_descriptive_name.sql`

## Timeline

```
2025-02-28  →  Users, profiles (start)
2025-03-05  →  Analytics, roles
2025-03-08  →  Categories
2025-03-09  →  Merchants, Products, Orders, Reviews
2025-03-15  →  Category delete functions
2025-03-16  →  Bulk delete categories
2025-03-22  →  Merchant delete functions
2025-05-03  →  Sections with products
2025-05-14  →  Cart, Wishlist
2025-05-23  →  Count total cart items (RPC)
2025-05-25  →  Recommendations (RPC)
2025-07-15  →  Cancel order + restore stock
2025-07-19  →  Reviewable products (RPC)
2025-07-20  →  Options + Option Values (variants)
2025-07-30  →  Visitor logs
2025-08-01  →  Transactions, Invoices, Refunds
2025-08-04  →  Merchant order details (RPC)
2025-08-05  →  Create transaction + invoices (RPC)
2025-08-07  →  Merchant transactions (RPC)
2025-08-08  →  Invoice details, Bandwidth logs (RPCs)
2026-01-25  →  Banners, Sections
2026-01-26  →  Refund system setup (3 migrations)
2026-05-11  →  Refund status helper
2026-05-12  →  Update cancel order function (add processing status)
2026-05-13  →  Add cancellation type to refunds
2026-05-14  →  Fix merchant_order_view (LEFT JOIN guests)
2026-06-01  →  Fix refund RPC permissions
2026-06-03  →  Fix refund RPC type casts
```

## Key Migration Groups

### Refund System (2026-01-26)
- `20260126000000_refund_system_setup.sql` — return_requests table, refund_config table, triggers
- `20260126000001_refund_helper_functions.sql` — 6 RPC functions (can_cancel, can_return, calculate_refund, etc.)
- `20260126000002_refund_permissions.sql` — GRANT EXECUTE permissions

### Payment (2025-08-01 to 2025-08-08)
- transactions + invoices + refunds tables
- Merchant transaction/invoice RPCs
- Bandwidth tracking

### Recent Fixes (2026-05 to 2026-06)
- Type casting fixes for Supabase RPC strict mode
- SECURITY DEFINER for refund RPCs (auth.users access)
- Guest order support in merchant order view
- Processing status added to cancel function

## Rollback Strategy

প্রত্যেক migration-এ rollback SQL (DROP/ALTER) অন্তর্ভুক্ত। প্রয়োজন হলে:

```sql
-- Example rollback
DROP FUNCTION IF EXISTS fn_get_return_stats;
DROP TABLE IF EXISTS return_requests CASCADE;
```
