/**
 * POST /api/orders/[id]/cancel
 * Submit a cancellation request (customer side)
 *
 * This does NOT cancel the order directly. Instead, it creates a
 * cancellation request for admin approval. If approved:
 *   - Order will be cancelled + stock restored
 *   - Online payments will be refunded via SSLCommerz
 *   - COD orders are cancelled without refund
 *
 * Path params:
 *   - id: string (order_id)
 *
 * Body:
 *   - reason: string (cancellation reason, required)
 */

import type { H3Event } from 'h3'
import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // ✅ Step 1: Authenticate user — only customers and admins can submit
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, ['customer', 'super_admin', 'admin'])

    // ✅ Step 2: Get order ID from route params
    const orderIdParam = getRouterParam(event, 'id')
    if (!orderIdParam) {
      return errorResponse(event, 400, 'Order ID is required')
    }

    // ✅ Step 3: Parse request body
    const body = await readBody(event).catch(() => ({}))
    const cancellationReason = body?.reason?.trim() || null

    if (!cancellationReason) {
      return errorResponse(event, 400, 'Cancellation reason is required')
    }

    // ✅ Step 4: Fetch order to verify ownership and status
    // Include payment_method and total_amount to determine refund flow
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, order_id, status, user_id, payment_method, total_amount')
      .eq('order_id', orderIdParam)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !order) {
      console.error('[cancel-request] Order not found:', fetchError?.message)
      return errorResponse(event, 404, 'Order not found')
    }

    // ✅ Step 5: Validate order status
    const cancellableStatuses = ['processing', 'pending', 'awaiting_payment']
    if (!cancellableStatuses.includes(order.status)) {
      return errorResponse(event, 400,
        `Order cannot be cancelled. Current status: ${order.status}`,
      )
    }

    // ✅ Step 6: Check for existing pending or approved cancellation request
    const { data: existingRequest, error: checkError } = await supabaseAdmin
      .from('refunds')
      .select('id, status')
      .eq('order_id', order.id)
      .eq('refund_type', 'cancellation')
      .in('status', ['pending', 'approved'])
      .maybeSingle()

    if (checkError) {
      console.error('[cancel-request] Error checking existing requests:', checkError.message)
      return errorResponse(event, 500, 'Failed to check existing cancellation requests')
    }

    if (existingRequest) {
      const statusMsg = existingRequest.status === 'approved'
        ? 'already approved'
        : 'pending review'
      return errorResponse(event, 400,
        `A cancellation request for this order is ${statusMsg}`,
      )
    }

    // ✅ Step 7: Determine if this is an online payment or COD
    // Online payments will need a refund if cancellation is approved
    // COD orders just need stock restored

    // ✅ Step 8: Fetch invoice for this order
    // Invoices are created for all orders during checkout
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('id')
      .eq('order_id', order.id)
      .limit(1)
      .maybeSingle()

    if (invoiceError) {
      console.error('[cancel-request] Error fetching invoice:', invoiceError.message)
      return errorResponse(event, 500, 'Failed to verify invoice information')
    }

    if (!invoice) {
      return errorResponse(event, 400, 'No invoice found for this order. Cannot process cancellation.')
    }

    // ✅ Step 9: Get transaction details — determine payment type from transaction
    let transactionId: number | null = null
    let isOnlinePayment = false

    const { data: transaction, error: txnError } = await supabaseAdmin
      .from('transactions')
      .select('id, payment_method')
      .eq('order_id', order.id)
      .limit(1)
      .maybeSingle()

    if (txnError) {
      console.error('[cancel-request] Error fetching transaction:', txnError.message)
      return errorResponse(event, 500, 'Failed to fetch payment transaction')
    }

    if (transaction) {
      transactionId = transaction.id
      isOnlinePayment = transaction.payment_method !== null && transaction.payment_method !== 'cod'
    }

    console.log('[cancel-request] Payment type:', {
      order_method: order.payment_method,
      transaction_method: transaction?.payment_method,
      isOnlinePayment,
    })

    // ✅ Step 10: Generate unique cancellation request ID
    const requestId = `CAN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // ✅ Step 11: Create cancellation request (refund record with type='cancellation')
    const { data: newRequest, error: insertError } = await supabaseAdmin
      .from('refunds')
      .insert({
        refund_id: requestId,
        invoice_id: invoice.id,
        transaction_id: transactionId,
        order_id: order.id,
        amount: order.total_amount,
        reason: cancellationReason,
        status: 'pending',
        refund_type: 'cancellation',
      })
      .select('id, refund_id, status')
      .single()

    if (insertError) {
      console.error('[cancel-request] Failed to create cancellation request:', insertError.message)
      return errorResponse(event, 500, 'Failed to submit cancellation request')
    }

    // ✅ Step 12: Return success with cancellation request details
    return successResponse(event, 200, {
      message: 'Cancellation request submitted successfully. Awaiting admin approval.',
      data: {
        request_id: newRequest.refund_id,
        status: newRequest.status,
        is_online_payment: isOnlinePayment,
        refund_amount: isOnlinePayment ? order.total_amount : 0,
      },
    })
  }
  catch (error: any) {
    console.error('[cancel-request] Error submitting cancellation request:', error)

    if (error?.statusCode === 401) {
      return errorResponse(event, 401, 'Unauthorized - Please login')
    }

    if (error?.message?.includes('permissions')) {
      return errorResponse(event, 403, 'Permission denied')
    }

    if (error?.statusCode === 400) {
      return errorResponse(event, 400, error.message)
    }

    return errorResponse(event, 500, 'Failed to submit cancellation request')
  }
})
