# API 06: Refunds & Returns (7 Endpoints)

## Refund/Return Lifecycle

```
Customer creates return request (POST /api/returns)
  → status: 'pending'
Admin approves (POST /api/dashboard/returns/:id/approve)
  → status: 'approved'
Admin marks received (POST /api/dashboard/returns/:id/mark-received)
  → status: 'received'
Admin processes refund (POST /api/refunds/:id/process)
  → calls SSLCommerz refund API
  → creates refunds record
  → status: 'processing' → 'completed'
Customer can withdraw before approval
  → status: 'withdrawn'
Admin can reject
  → status: 'rejected'
```

## Customer-facing (4)

| Method | Path | কী করে | Auth |
|--------|------|--------|------|
| POST | `/api/returns` | রিটার্ন/ক্যান্সেল রিকোয়েস্ট তৈরি | JWT + ownership |
| GET | `/api/returns` | ইউজারের রিটার্ন রিকোয়েস্ট লিস্ট | JWT |
| GET | `/api/returns/[id]` | ডিটেল | JWT + ownership |
| POST | `/api/returns/[id]/withdraw` | রিকোয়েস্ট উইথড্র | JWT + ownership |

## Admin Refund Processing (3)

| Method | Path | কী করে | Auth |
|--------|------|--------|------|
| GET | `/api/refunds/status` | SSLCommerz refund status check | JWT + role |
| GET | `/api/refunds/[id]` | রিফান্ড ডিটেল (optional live check) | JWT + role |
| POST | `/api/refunds/[id]/process` | রিফান্ড প্রক্রিয়াকরণ (SSLCommerz API) | super_admin, admin |

## Key Files

| File | কী করে |
|------|--------|
| `server/utils/refund/RefundManager.ts` | কোর রিফান্ড বিজনেস লজিক (~300 lines) |
| `server/utils/refund/RefundConfig.ts` | কনফিগারেশন সিস্টেম (5-min cache, DB-backed) |
| `server/ssl/api/refund-helper.ts` | SSLCommerzRefundHelper |
| `server/database/` | refund-related RPCs |

## Important Notes

- **No Zod anywhere** in these 9 endpoints — সব manual validation
- **Auth inconsistency** — কিছু endpoint `user_metadata.role` চেক করে, কিছু `profiles` টেবিল
- **RefundConfig** has in-memory cache with 5-min TTL, falls back to defaults if DB unavailable
- Cancellation এবং Refund — দুটোই return_requests টেবিলে যায়, কিন্তু আলাদা `type` দিয়ে
