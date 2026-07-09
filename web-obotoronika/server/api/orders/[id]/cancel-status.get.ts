/**
 * GET /api/orders/[id]/cancel-status
 * Check if an order has a pending/approved/rejected cancellation request
 *
 * Path params:
 *   - id: string (order_id)
 *
 * Returns:
 *   - has_cancel_request: boolean
 *   - cancel_status: string | null
 *   - cancel_id: string | null
 */

import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // ✅ Step 1: Authenticate user
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, ['customer', 'super_admin', 'admin'])

    // ✅ Step 2: Get order ID from params
    const orderIdParam = getRouterParam(event, 'id')

    if (!orderIdParam) {
      return errorResponse(event, 400, 'Order ID is required')
    }

    // ✅ Step 3: Fetch order to verify ownership
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('order_id', orderIdParam)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !order) {
      return errorResponse(event, 404, 'Order not found')
    }

    // ✅ Step 4: Check for existing cancellation requests
    const { data: cancelRequest, error: cancelError } = await supabaseAdmin
      .from('refunds')
      .select('id, refund_id, status, amount, reason, created_at')
      .eq('order_id', order.id)
      .eq('refund_type', 'cancellation')
      .in('status', ['pending', 'approved', 'rejected'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (cancelError || !cancelRequest) {
      return successResponse(event, 200, {
        has_cancel_request: false,
        cancel_status: null,
        cancel_id: null,
      })
    }

    // ✅ Step 5: Return cancellation request status
    return successResponse(event, 200, {
      has_cancel_request: true,
      cancel_status: cancelRequest.status,
      cancel_id: cancelRequest.refund_id,
      cancel_amount: cancelRequest.amount,
      cancel_reason: cancelRequest.reason,
      cancel_created_at: cancelRequest.created_at,
    })
  }
  catch (error: any) {
    console.error('[cancel-status] Error checking cancellation status:', error)

    if (error?.statusCode === 401) {
      return errorResponse(event, 401, 'Unauthorized - Please login')
    }

    if (error?.statusCode === 404) {
      return errorResponse(event, 404, error.message)
    }

    return errorResponse(event, 500, 'Failed to check cancellation status')
  }
})
