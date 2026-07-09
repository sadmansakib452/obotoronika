/**
 * GET /api/orders/[id]/refund-status
 * Check if an order has a refund request (customer side)
 *
 * Path params:
 *   - id: string (order_id)
 *
 * Returns:
 *   - has_refund_request: boolean
 *   - refund_status: string | null
 *   - refund_id: string | null
 */

import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // ✅ Step 1: Authenticate user
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, ['customer', 'super_admin'])

    // ✅ Step 2: Get order ID from params
    const orderIdParam = getRouterParam(event, 'id')

    if (!orderIdParam) {
      return errorResponse(event, 400, 'Order ID is required')
    }

    const orderId = orderIdParam

    // ✅ Step 3: Fetch order to verify ownership
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !order) {
      return errorResponse(event, 404, 'Order not found')
    }

    // ✅ Step 4: Get invoice for this order
    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select('id')
      .eq('order_id', order.id)
      .single()

    if (!invoice) {
      return successResponse(event, 200, {
        has_refund_request: false,
        refund_status: null,
        refund_id: null,
      })
    }

    // ✅ Step 5: Check for existing refund
    const { data: refund, error: refundError } = await supabaseAdmin
      .from('refunds')
      .select('id, refund_id, status, amount, reason, created_at')
      .eq('invoice_id', invoice.id)
      .in('status', ['pending', 'approved', 'rejected'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // If no refund exists, return false
    if (refundError || !refund) {
      return successResponse(event, 200, {
        has_refund_request: false,
        refund_status: null,
        refund_id: null,
      })
    }

    // ✅ Step 6: Return refund status
    return successResponse(event, 200, {
      has_refund_request: true,
      refund_status: refund.status,
      refund_id: refund.refund_id,
      refund_amount: refund.amount,
      refund_reason: refund.reason,
      refund_created_at: refund.created_at,
    })
  }
  catch (error: any) {
    console.error('[refund-status] Error checking refund status:', error)

    if (error?.statusCode === 401) {
      return errorResponse(event, 401, 'Unauthorized - Please login')
    }

    if (error?.statusCode === 404) {
      return errorResponse(event, 404, error.message)
    }

    return errorResponse(event, 500, 'Failed to check refund status')
  }
})