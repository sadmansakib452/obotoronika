# API 03: Orders (16 Endpoints)

## Order Lifecycle

```
pending → awaiting_payment → processing → shipped → delivered → completed
  ↓            ↓
canceled    returned → refunded
```

## Endpoints

| Method | Path | Handler | Auth |
|--------|------|---------|------|
| GET | `/api/orders` | লিস্ট (paginated) | customer, admin, super_admin |
| POST | `/api/orders` | **অর্ডার ক্রিয়েট** (complex: stock rollback, RPC call) | customer, admin, manager, super_admin |
| PATCH | `/api/orders/checkout` | চেকআউট কমপ্লিট (payment info + method) | customer, admin, manager, super_admin |
| GET | `/api/orders/counts` | প্রসেসিং + ডেলিভারড কাউন্ট | customer, admin, super_admin |
| GET | `/api/orders/cancelled` | ক্যান্সেলড অর্ডার | customer, admin, super_admin |
| GET | `/api/orders/processing` | প্রসেসিং | customer, admin, super_admin |
| GET | `/api/orders/shipped` | শিপড | customer, admin, super_admin |
| GET | `/api/orders/delivered` | ডেলিভারড | customer, admin, super_admin |
| GET | `/api/orders/returned` | রিটার্নড | customer, admin, super_admin |
| GET | `/api/orders/auto-cancel` | 🚫 **NO AUTH!** ৩০ মিনিট পুরনো pending অর্ডার ক্যান্সেল (cron) | None |
| GET | `/api/orders/[id]` | সিঙ্গেল অর্ডার ডিটেল | customer, admin, super_admin |
| POST | `/api/orders/[id]/cancel` | **ক্যান্সেল রিকোয়েস্ট** (refund record তৈরি) | customer, admin, super_admin |
| GET | `/api/orders/[id]/cancel-status` | ক্যান্সেল রিকোয়েস্ট স্ট্যাটাস | customer, admin, super_admin |
| POST | `/api/orders/[id]/refund` | **রিফান্ড রিকোয়েস্ট** (delivered অর্ডারের জন্য) | customer, super_admin |
| GET | `/api/orders/[id]/refund-status` | রিফান্ড স্ট্যাটাস | customer, super_admin |
| GET | `/api/orders/[id]/update-status` | 😕 **GET method দিয়ে status mutate** — awaiting_payment সেট | admin, super_admin |

## Key Files

| File | কী করে |
|------|--------|
| `server/utils/orders.ts` | `generateOrderId()`, `generateSubOrderIds()`, `decreaseProductStock()` (with rollback) |
| `server/utils/query.ts` | `ordersQuerySchema` + `checkoutQuery` |
| `server/database/schema-validator.ts` | `orderStatusSchema` |

## Important Notes

- **auto-cancel** — public endpoint, intended for cron. No auth guard. ⚠️
- **update-status** — GET method দিয়ে state mutation করা (unconventional)
- **Order create flow** most complex handler: stock check → order IDs generate → insert → RPC (transaction+invoice) → stock decrease → cart clear → rollback on error
- Status filter endpoints (cancelled/processing/shipped/delivered/returned) — almost identical code, could be refactored into single endpoint with `status` param
