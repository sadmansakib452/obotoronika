/**
 * Refunds API - Chapter 7 Step 7.2
 * GET /api/refunds/status
 *
 * Purpose: Check refund status from SSLCommerz
 *          Use the refund_ref_id returned from process endpoint
 *
 * Query Parameters:
 *   - refund_ref_id: The refund reference ID from SSLCommerz
 *   - return_id?: Optional - to verify ownership (for customers)
 */

import type { H3Event } from 'h3'
import { RefundManager } from '~~/server/utils/refund/RefundManager'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import supabaseAdmin from '~~/server/utils/supabaseAdmin'
import checkUserRole from '~~/server/utils/checkUserRole'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // 1. Check authentication
    const supabase = await getServerSupabase(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse(event, 401, 'Unauthorized - Please login')
    }

    // 2. Get refund_ref_id from query
    const query = getQuery(event)
    const refundRefId = query.refund_ref_id as string

    if (!refundRefId || refundRefId.trim().length === 0) {
      return errorResponse(event, 400, 'refund_ref_id is required')
    }

    // 3. Check if user is admin (from user_metadata)
    const userRole = user.user_metadata?.role
    const isAdmin = userRole === 'super_admin' || userRole === 'admin'

    // 4. If not admin, verify user owns this return request
    if (!isAdmin) {
      const { data: returnRequest } = await supabaseAdmin
        .from('return_requests')
        .select('id, user_id, status')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      // For customers, we can only check by return_id if provided
      const returnId = query.return_id as string
      if (returnId) {
        const { data: specificRequest } = await supabaseAdmin
          .from('return_requests')
          .select('id, user_id')
          .eq('id', parseInt(returnId))
          .single()

        if (specificRequest && specificRequest.user_id !== user.id) {
          return errorResponse(event, 403, 'You do not have permission to view this refund')
        }
      }
    }

    // 5. Check refund status using RefundManager
    const refundManager = new RefundManager()
    const status = await refundManager.checkRefundStatus(refundRefId)

    // 6. Format status for display
    const statusMessages: Record<string, string> = {
      refunded: 'Refund has been completed successfully',
      processing: 'Refund is being processed by the payment gateway',
      cancelled: 'Refund request was cancelled',
      failed: 'Refund failed. Please contact support.',
    }

    // 7. Return response
    return successResponse(event, 200, {
      refund_ref_id: refundRefId,
      status: status.status,
      status_message: statusMessages[status.status] || 'Unknown status',
      initiated_on: status.initiated_on || null,
      refunded_on: status.refunded_on || null,
      error: status.errorReason || null,
    })
  }
  catch (error: any) {
    console.error('[Refunds status GET] Error:', error)
    return errorResponse(
      event,
      error?.statusCode || 500,
      error?.message || 'Failed to check refund status',
    )
  }
})
