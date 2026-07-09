# API 04: SSLCommerz Payment (2 Endpoints)

## Payment Flow

```
1. User clicks "Pay" → GET /api/payment?order_id=xxx
2. Server builds SSLCommerz payload → calls sslcz.init()
3. Returns mobile banking options (bKash, Nagad, DBBL)
4. User redirected to SSLCommerz page → completes payment
5. SSLCommerz → POST /api/payment/ipn (webhook)
6. Server validates → updates transaction + order status
7. User redirected to success/fail page
```

## Endpoints

| Method | Path | কী করে | Auth |
|--------|------|--------|------|
| POST | `/api/payment/ipn` | SSLCommerz webhook receiver + validator | **None** (public by design) |
| GET | `/api/payment` | পেমেন্ট সেশন ইনিশিয়েট | None (uses service_role) |

## Key Files

| File | কী করে |
|------|--------|
| `server/ssl/index.ts` | SDK facade |
| `server/ssl/api/payment-controller.ts` | 6 SSLCommerz API methods |
| `server/ssl/api/payment-init-data-process.ts` | Transform → SSLCommerz fields (80+ fields) |
| `server/ssl/api/refund-helper.ts` | SSLCommerzRefundHelper class |
| `server/ssl/api/fetch.ts` | HTTP call wrapper |

## IPN Webhook Details

- SSLCommerz payment status update পেলে প্রথমে `tran_id` চেক করে
- SSLCommerz validation API call করে ট্রানজেকশন ভেরিফাই
- তারপর আপডেট: `transactions` → `orders` → `merchant_orders`
- কার্ট ক্লিনআপ: purchased items মুছে দেয়
- Error handling: প্রতিটি ধাপে আলাদা error message

## Notes

- SSLCommerz-এর নিজস্ব Node.js SDK নেই — কাস্টম SDK বানানো হয়েছে
- `payment-controller.ts`-এ সব method একই API endpoint ইউজ করে (শুধু query params আলাদা)
- `payment-init-data-process.ts`-এ 70+ লাইন dead code (commented-out FormData logic)
- Only **mobile banking** options return করা হয় (bKash, Nagad, DBBL)
- bKash amount `hardcoded` আছে বলে progress.md-এ উল্লেখ আছে
