# Feature 02: Payment Flow

## পেমেন্ট প্রক্রিয়া

```
1. User creates order → POST /api/orders
   → status: 'pending'

2. GET /api/payment?order_id=xxx
   → Fetch order + transaction + user
   → Build SSLCommerz payload
   → sslcz.init() → payment URLs
   → Return mobile banking options (bKash, Nagad, DBBL)

3. User selects payment method
   → PATCH /api/orders/checkout
   → Updates order with payment_method + payment_info
   → Redirect to SSLCommerz payment page (or bKash modal)

4. SSLCommerz → POST /api/payment/ipn (webhook)
   → Validate signature
   → Fetch transaction by tran_id
   → Update: transactions (payment_details, status)
   → Update: orders (status → 'processing', payment_method)
   → Update: merchant_orders (status → 'processing')
   → Clear purchased cart items

5. User redirected to:
   → /order-received (success)
   → /fail (failure)
   → /cancel (user cancelled)
```

## SSLCommerz Integration

```
server/ssl/
├── index.ts                       → Facade (extends SslCommerzPayment)
├── api/
│   ├── payment-controller.ts      → 6 API methods (init, validate, refund, queries)
│   ├── payment-init-data-process.ts → 80+ field mapping
│   ├── refund-helper.ts           → SSLCommerzRefundHelper (typed)
│   └── fetch.ts                   → HTTP wrapper (URL-encoded)
```

## IPN Handler Details

`server/api/payment/ipn.ts`:
- SSLCommerz থেকে POST request আসে যখন payment complete হয়
- `tran_id` চেক করে transaction exist কিনা
- SSLCommerz validation API call করে ট্রানজেকশন ভেরিফাই
- Fail-open: যে ধাপেই fail করুক, error log করে gracefully handle করে
- Public endpoint (no auth — by design, SSLCommerz call করে)

## Key Files

| File | Role |
|------|------|
| `server/ssl/api/payment-controller.ts` | Core SDK: 6 methods |
| `server/api/payment/ipn.ts` | Webhook handler |
| `server/api/payment/index.get.ts` | Payment init |
| `server/api/orders/checkout.patch.ts` | Checkout completion |
| `app/pages/checkout/payment-method.vue` | Payment method selection |
| `app/pages/order-received.vue` | Success page |
| `app/pages/fail.vue` / `cancel.vue` | Failure pages |
| `app/components/payment-methods/Bkash.vue` | bKash form |

## Issues

- bKash amount **hardcoded** (progress.md)
- `payment-controller.ts` — transactionQueryBySessionId URL looks incorrect (uses refund endpoint)
- SSLCommerz SDK — no official Node.js package, custom implementation
