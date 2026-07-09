# Feature 03: Order Flow

## অর্ডার প্লেসমেন্ট

```
1. POST /api/orders
   body: { items: [...], shippingAddress: {...} }

   → Validate items (non-empty)
   → Fetch products (price, stock check)
   → Fetch billing address
   → generateOrderId()       → ORD-{ts}-{seq}
   → generateSubOrderIds(n)  → SUBORD-{ts}-{seq}
   → decreaseProductStock()  → with rollback tracking
   
   → INSERT orders, merchant_orders, order_items
   → RPC: create_transaction_and_invoices()
   → DELETE cart_items (clear cart)
   
   → On error: restoreProductStock() (rollback)
```

## অর্ডার স্ট্যাটাস মেশিন

```
pending ──→ awaiting_payment ──→ processing ──→ shipped ──→ delivered ──→ completed
   │              │                   │
   └── canceled ←─┘                   │
               (refund তৈরি)          │
                         └── returned ──→ refunded
```

## অর্ডার ভিউ (ইউজার)

```
GET /api/orders                          → সব অর্ডার
GET /api/orders/processing               → প্রসেসিং
GET /api/orders/shipped                  → শিপড
GET /api/orders/delivered                → ডেলিভারড
GET /api/orders/cancelled               → ক্যান্সেলড
GET /api/orders/returned                → রিটার্নড
GET /api/orders/counts                  → প্রসেসিং + ডেলিভারড কাউন্ট
GET /api/orders/[id]                    → সিঙ্গেল অর্ডার
```

## ক্যান্সেলেশন

```
Customer → POST /api/orders/[id]/cancel
  → Validate: order status cancellable? (pending, processing, awaiting_payment)
  → Check: existing cancellation request?
  → Create: refunds record (refund_type: 'cancellation', status: 'pending')
  → Admin must approve (via dashboard)

Admin → POST /api/dashboard/returns/[id]/approve
  → RefundManager.approveReturn()
```

## রিফান্ড (ডেলিভারড অর্ডার)

```
Customer → POST /api/orders/[id]/refund
  → Validate: status === 'delivered', valid reason
  → Create: refunds record (refund_type: 'refund')
  → Admin processes → POST /api/refunds/[id]/process
    → SSLCommerz initiateRefund API
    → Creates refunds record
    → Updates order → 'refunded'
```

## Key Files

| File | Role |
|------|------|
| `server/api/orders/index.post.ts` | Order create (most complex handler) |
| `server/utils/orders.ts` | ID generation, stock decrease |
| `server/utils/query.ts` | ordersQuerySchema |
| `server/utils/refund/RefundManager.ts` | Refund lifecycle |
| `server/stores/orders.ts` | Customer order store |
| `server/stores/dashboard.ts` | Admin order store |
| `app/pages/user/orders/` | Customer order pages |
| `app/pages/dashboard/orders/` | Admin order pages |
