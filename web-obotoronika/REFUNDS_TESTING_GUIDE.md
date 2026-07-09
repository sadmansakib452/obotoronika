# Refunds Module - Testing Guide

## Prerequisites

Before testing, ensure all migrations are applied:

```bash
npm run db:push
```

## Manual Testing Checklist

### Phase 1: Database & Migration Tests

- [ ] Verify `refunds` table has new columns (admin_note, refund_ref_id, updated_by)
- [ ] Verify `refund_status` enum has 'rejected' value
- [ ] Test RPC functions manually in Supabase SQL Editor:

```sql
-- Test get_refunds_list
SELECT * FROM get_refunds_list(NULL, NULL, 10, 0);

-- Test get_refunds_count
SELECT * FROM get_refunds_count(NULL, NULL);

-- Test update_refund_status
SELECT update_refund_status(1, 'approved', 'Test note', NULL);
```

### Phase 2: API Endpoint Tests

- [ ] Test GET /api/dashboard/finance/refunds (with auth)
  - Should return paginated list
  - Should support ?page=1&perPage=10
  - Should support ?q=search
  - Should support ?status=pending

- [ ] Test GET /api/dashboard/finance/refunds/[id]
  - Should return single refund details

- [ ] Test PATCH /api/dashboard/finance/refunds/[id]
  - Should approve pending refund
  - Should reject pending refund
  - Should fail for non-pending refunds

### Phase 3: Frontend UI Tests

- [ ] Navigate to /dashboard/finance/refunds
- [ ] Verify table displays with correct columns
- [ ] Test search functionality
- [ ] Test status filter dropdown
- [ ] Test pagination
- [ ] Click "View" button - verify modal opens
- [ ] Click "Approve" button - verify modal opens
- [ ] Click "Reject" button - verify modal opens
- [ ] Submit approve action - verify success toast
- [ ] Submit reject action - verify success toast
- [ ] Verify status badge updates after action

## Common Issues & Solutions

### Issue 1: "refund_status enum error"
**Solution:** Run migration again - sometimes enum additions need re-run

### Issue 2: "Permission denied" on API
**Solution:** Ensure user has correct role (super_admin, admin, or manager)

### Issue 3: "Refund not found" on PATCH
**Solution:** Check that refund ID exists in database

### Issue 4: Table not loading
**Solution:**
1. Check browser console for errors
2. Verify API returns data (test in Postman/curl)
3. Check store state in Vue DevTools

## API Testing with curl

```bash
# Get refunds list
curl -X GET "http://localhost:3000/api/dashboard/finance/refunds?page=1&perPage=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get single refund
curl -X GET "http://localhost:3000/api/dashboard/finance/refunds/1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Approve refund
curl -X PATCH "http://localhost:3000/api/dashboard/finance/refunds/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved", "admin_note": "Approved manually"}'

# Reject refund
curl -X PATCH "http://localhost:3000/api/dashboard/finance/refunds/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "rejected", "admin_note": "Customer request"}'
```

## Expected Database Flow

1. Admin clicks "Approve"
2. API calls SSLCommerz (sandbox)
3. If successful, updates refund status to 'approved'
4. Updates invoice status to 'refunded'
5. Returns success response

## SSLCommerz Sandbox Testing

- Currently using sandbox mode (is_live = false)
- If no bank_tran_id exists, SSLCommerz call is skipped
- Check console logs for SSLCommerz response