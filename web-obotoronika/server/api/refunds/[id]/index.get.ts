/**
 * Refunds API - Chapter 7 Step 7.3
 * GET /api/refunds/:id
 *
 * Purpose: Get refund details for a specific return request
 *          Includes refund record and optionally checks live status
 *
 * Path Parameters:
 *   - id: Return request ID
 *
 * Query Parameters:
 *   - check_live_status?: Set to "true" to poll SSLCommerz for latest status
 */

import type { H3Event } from 'h3'
import { RefundManager } from '~~/server/utils/refund/RefundManager'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import supabaseAdmin from '~~/server/utils/supabaseAdmin'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // 1. Check authentication
    const supabase = await getServerSupabase(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse(event, 401, 'Unauthorized - Please login')
    }

    // 2. Get return request ID from path
    const returnId = getRouterParam(event, 'id')

    if (!returnId || isNaN(parseInt(returnId))) {
      return errorResponse(event, 400, 'Invalid return request ID')
    }

    const returnRequestId = parseInt(returnId)

    // 3. Check if user is admin (from user_metadata)
    const userRole = user.user_metadata?.role
    const isAdmin = userRole === 'super_admin' || userRole === 'admin'

    // 4. Fetch return request with refund info
    const { data: returnRequest, error: fetchError } = await supabaseAdmin
      .from('return_requests')
      .select(`
        *,
        orders!inner(order_id, total_amount, status),
        refunds(refund_id, amount, status, created_at)
      `)
      .eq('id', returnRequestId)
      .single()

    if (fetchError || !returnRequest) {
      return errorResponse(event, 404, 'Return request not found')
    }

    // 5. Check ownership for non-admin users
    if (!isAdmin && returnRequest.user_id !== user.id) {
      return errorResponse(event, 403, 'You do not have permission to view this refund')
    }

    // 6. Parse query for live status check
    const query = getQuery(event)
    const checkLiveStatus = query.check_live_status === 'true'

    let liveStatus = null

    // 7. If there's a refund record and live check is requested
    if (returnRequest.refunds && returnRequest.refunds.length > 0 && checkLiveStatus) {
      const refundRecord = returnRequest.refunds[0]
      if (refundRecord.refund_id) {
        const refundManager = new RefundManager()
        liveStatus = await refundManager.checkRefundStatus(refundRecord.refund_id)

        // If status has changed, update our records
        if (liveStatus.status !== returnRequest.status) {
          let newStatus = returnRequest.status

          if (liveStatus.status === 'refunded') {
            newStatus = 'completed'
          }
          else if (liveStatus.status === 'failed') {
            newStatus = 'failed'
          }

          // Update return request status if changed
          if (newStatus !== returnRequest.status) {
            await supabaseAdmin
              .from('return_requests')
              .update({
                status: newStatus,
                updated_at: new Date().toISOString(),
              })
              .eq('id', returnRequestId)
          }

          // Also update order status if completed
          if (newStatus === 'completed') {
            await supabaseAdmin
              .from('orders')
              .update({
                status: 'refunded',
                updated_at: new Date().toISOString(),
              })
              .eq('id', returnRequest.order_id)
          }
        }
      }
    }

    // 8. Format response
    const refundRecord = returnRequest.refunds?.[0]

    return successResponse(event, 200, {
      return_request: {
        id: returnRequest.id,
        order_id: returnRequest.order_id,
        type: returnRequest.type,
        status: returnRequest.status,
        reason: returnRequest.reason,
        created_at: returnRequest.created_at,
      },
      order: returnRequest.orders
        ? {
            order_id: returnRequest.orders.order_id,
            total_amount: returnRequest.orders.total_amount,
            status: returnRequest.orders.status,
          }
        : null,
      refund: refundRecord
        ? {
            refund_id: refundRecord.refund_id,
            amount: refundRecord.amount,
            status: refundRecord.status,
            created_at: refundRecord.created_at,
          }
        : null,
      live_status: liveStatus,
    })
  }
  catch (error: any) {
    console.error('[Refunds :id GET] Error:', error)
    return errorResponse(
      event,
      error?.statusCode || 500,
      error?.message || 'Failed to fetch refund details',
    )
  }
})
