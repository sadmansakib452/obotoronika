# Feature 04: Refund & Return Flow

## পুরো লাইফসাইকেল

```
Customer creates return/cancellation
         │
         ▼
    ┌─ Pending ──────────────────────────┐
    │        ↕                            │
    │  Admin reviews                      │ Customer withdraws
    │        ↕                            │   → Withdrawn
    ├── Approve ──→ Received ──→ Process ─┤
    │        (admin       (admin   (triggers│
    │         approves)   marks    SSLCom- │
    │                    received)  merz)  │
    └── Reject                             │
         → status: rejected,              │
           order restored                 │
                                          ▼
                                     Completed / Failed
```

## Return Creation

```
POST /api/returns
  body: { order_id, type: 'cancellation'|'return', reason, description?, images?, refund_method? }

  → RefundManager.createReturnRequest()
  → Validates: order ownership, order status (config-driven)
  → Checks: duplicate pending return?
  → Calculates: refund amount (via RefundManager.calculateRefundAmount)
  → Inserts: return_requests
  → Updates: order status → 'canceled' or 'return_pending'
```

## Admin Actions

| Action | Endpoint | Effect |
|--------|----------|--------|
| Approve | `POST /dashboard/returns/:id/approve` | Status → 'approved' |
| Reject | `POST /dashboard/returns/:id/reject` | Status → 'rejected', order restored |
| Mark Received | `POST /dashboard/returns/:id/mark-received` | Status → 'received' |
| Process Refund | `POST /api/refunds/:id/process` | SSLCommerz API call → 'processing'/'completed'/'failed' |

## Refund Calculation

`RefundManager.calculateRefundAmount(orderId)`:
1. Uses `store_amount` (post-gateway-fee) if configured in `refund_config`
2. Deducts shipping cost if `refund_config.rules.deduct_shipping_cost = true`
3. Falls back to: `order_total - 4% estimated commission`
4. Minimum: 0 (never negative)

## Configuration System

`RefundConfig` — DB-backed config with 5-min TTL cache:

```typescript
{
  timing: { return_days: 7, cancellation_days: 1, processing_days: 7 },
  rules: { deduct_shipping: false, partial_refund: true, store_credit: false },
  gateways: { sslcommerz: { enabled: true, window_days: 90 }, bkash: { enabled: false } },
  cancellation_allowed_status: ['pending', 'processing'],
  return_allowed_status: ['delivered', 'completed']
}
```

## Key Files

| File | Role |
|------|------|
| `server/utils/refund/RefundManager.ts` | Lifecycle orchestrator |
| `server/utils/refund/RefundConfig.ts` | Config with caching |
| `server/utils/refund/types.ts` | Type definitions |
| `server/ssl/api/refund-helper.ts` | SSLCommerz refund client |
| `server/api/returns/` | Customer endpoints |
| `server/api/refunds/` | Admin endpoints |
| `server/api/dashboard/returns/` | Dashboard endpoints |
| `app/composables/useReturns.ts` | Client composable |
| `app/stores/returns.ts` | Pinia store |

## Issues (from scan)

- No Zod schemas in any refund/return endpoint
- Auth inconsistency: some check `user_metadata.role`, some check `profiles` table
- `refunds/status.get.ts` vs `returns/[id]/index.get.ts` — different admin check patterns
