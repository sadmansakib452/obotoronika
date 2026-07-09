# Customer Refund/Return - Testing Guide

## Prerequisites

Ensure all migrations are applied:
```bash
npm run db:push
```

## Testing Checklist

### Phase 1: Cancel Order Tests

- [ ] Navigate to `/user/orders`
- [ ] Find an order with "processing" status
- [ ] Click "Cancel Order" button
- [ ] Confirm modal appears with reason dropdown
- [ ] Select a reason and click "Yes, Cancel Order"
- [ ] Verify success toast appears
- [ ] Verify order moves to "Cancelled" tab
- [ ] Verify product stock is restored

### Phase 2: Refund Request Tests (Customer Side)

- [ ] Navigate to `/user/orders`
- [ ] Find an order with "delivered" status
- [ ] Verify "Request Refund" button appears
- [ ] Click "Request Refund" button
- [ ] Verify modal appears with reason dropdown
- [ ] Select a reason (required) and add optional message
- [ ] Click "Submit Request"
- [ ] Verify success toast appears
- [ ] Verify "Refund: pending" badge appears on order card
- [ ] Verify button changes to "View Refund Status"

### Phase 3: Order Details Page Tests

- [ ] Navigate to `/user/orders/[delivered_order_id]`
- [ ] Verify "Request Refund" button (if no refund requested)
- [ ] Verify "Refund: pending/approved/rejected" badge (if refund exists)
- [ ] Click "Request Refund" on order detail page
- [ ] Submit a refund request
- [ ] Verify refund status section appears

### Phase 4: Admin Side Tests

- [ ] Navigate to `/dashboard/finance/refunds`
- [ ] Verify new refund request appears in list
- [ ] Verify customer details are visible
- [ ] Click "Approve" button
- [ ] Confirm modal and submit
- [ ] Verify success toast
- [ ] Return to customer side and verify status changed to "approved"

### Phase 5: API Tests

```bash
# Test cancel order (needs authenticated session)
curl -X POST "http://localhost:3000/api/orders/ORD123/cancel" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Changed mind"}'

# Test refund request
curl -X POST "http://localhost:3000/api/orders/ORD123/refund" \
  -H "Content-Type: application/json" \
  -d '{"reason": "product_damaged", "message": "Box was damaged"}'

# Test check refund status
curl -X GET "http://localhost:3000/api/orders/ORD123/refund-status"
```

## Common Issues & Solutions

### Issue: "Order not found" on cancel
- **Cause:** User doesn't own the order
- **Fix:** Ensure you're logged in as the customer who placed the order

### Issue: "Order cannot be cancelled"
- **Cause:** Order status is not processing/pending/awaiting_payment
- **Fix:** Only these statuses can be cancelled

### Issue: "Refund can only be requested for delivered orders"
- **Cause:** Order status is not 'delivered'
- **Fix:** Only delivered orders can request refunds

### Issue: "A refund request already exists"
- **Cause:** There's already a pending refund for this order's invoice
- **Fix:** Check existing refund status on order page

## Expected Flow

```
1. Customer places order → status: processing
2. Order delivered → status: delivered, "Request Refund" appears
3. Customer submits refund → refund status: pending
4. Admin sees refund in dashboard
5. Admin approves → refund status: approved → SSLCommerz refund triggered
6. Customer sees "Refund: approved" on their order
```

## Database Verification

Check refund was created:
```sql
SELECT * FROM refunds ORDER BY created_at DESC LIMIT 5;
```

Check invoice status updated:
```sql
SELECT id, invoice_id, status FROM invoices ORDER BY created_at DESC LIMIT 5;
```

## Testing Notes

- Cancel order works for: processing, pending, awaiting_payment
- Refund request works for: delivered (only)
- Each order can only have 1 pending refund at a time
- When admin approves, it triggers SSLCommerz (sandbox mode)