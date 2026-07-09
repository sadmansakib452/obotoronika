# Database 01: Schema Overview

## Core Tables

```
auth.users (Supabase managed)
  ├── profiles          (user metadata mirror)
  ├── addresses         (user addresses)
  ├── user_sessions     (custom auth sessions)
  ├── reviews           (product reviews)
  └── cart_items        (shopping cart)
  └── wishlist_items    (wishlist)

merchants
  └── products
       └── order_items
            └── orders ─── merchant_orders
                  └── transactions ─── invoices
                        └── refunds

categories            (self-referencing hierarchy)
sections              (homepage sections)
banners               (promotional banners)

options ─── option_values  (product variants)

return_requests       (cancellation + return)
verifications         (OTP, email/phone verify)
visitor_logs          (anonymous analytics)
bandwidth_logs        (API bandwidth tracking)
refund_config         (refund rules, DB-backed config)
```

## Table Details

### orders
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGSERIAL PK | Internal ID |
| `order_id` | TEXT UNIQUE | Public ID: ORD-xxx |
| `user_id` | UUID → auth.users | Nullable for guests |
| `status` | order_status ENUM | pending → delivered/canceled/refunded |
| `total_amount` | NUMERIC | |
| `shipping_address` | JSONB | |
| `payment_method` | TEXT | |

### products
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `merchant_id` | INT FK → merchants | |
| `category_id` | INT FK → categories | |
| `title`, `slug` | TEXT | |
| `price`, `offer_price` | NUMERIC | |
| `current_stock` | INT | |
| `status` | product_status ENUM | draft/published/archived/pending |
| `thumbnail`, `files` | TEXT | Image URLs |
| `variants` | JSONB | |
| `product_visibility` | JSONB | Section visibility |

### transactions
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGSERIAL PK | |
| `transaction_id` | TEXT UNIQUE | TXN-xxx |
| `order_id` | BIGINT FK → orders | |
| `amount` | NUMERIC | |
| `status` | transaction_status ENUM | pending/completed/failed/refunded |
| `payment_method` | TEXT | |
| `payment_details` | JSONB | SSLCommerz response |

### invoices
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGSERIAL PK | |
| `invoice_id` | TEXT UNIQUE | INV-YYYYMMDD-SEQ |
| `order_id` | BIGINT FK | |
| `merchant_id` | INT FK → merchants | Per-merchant invoice |
| `subtotal`, `shipping_cost`, `total` | NUMERIC | |
| `status` | invoice_status ENUM | unpaid/paid/overdue/refunded |

### refunds
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGSERIAL PK | |
| `refund_id` | TEXT UNIQUE | REF-xxx / CAN-xxx |
| `invoice_id` | BIGINT FK | |
| `amount` | NUMERIC | |
| `status` | refund_status ENUM | pending/approved/rejected/paid |
| `refund_type` | TEXT | 'refund' or 'cancellation' |
| `admin_note` | TEXT | |

### return_requests
| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGSERIAL PK | |
| `order_id` | BIGINT FK | |
| `user_id` | UUID FK | |
| `type` | return_type ENUM | cancellation/return |
| `status` | return_status ENUM | pending/approved/rejected/received/processing/completed/failed/withdrawn |
| `reason`, `description` | TEXT | |
| `items` | JSONB | |
| `refund_method` | TEXT | |

## Enums

| Enum Name | Values |
|-----------|--------|
| order_status | pending, awaiting_payment, processing, shipped, delivered, completed, canceled, returned, refunded, failed |
| product_status | draft, published, archived, pending |
| merchant_status | active, inactive, pending, suspended, banned |
| return_status | pending, approved, rejected, received, processing, completed, failed, withdrawn |
| return_type | cancellation, return |
| refund_status | pending, approved, rejected, paid |
| transaction_status | pending, completed, failed, refunded |
| invoice_status | unpaid, paid, overdue, refunded |

## Views

| View | Description |
|------|-------------|
| `extended_users` | `auth.users` থেকে id, email, phone, raw_user_meta_data |
| `merchant_order_view` | merchant_orders + orders + extended_users (LEFT JOIN for guests) |
| `user_review_details` | reviews + joined data for customer view |
