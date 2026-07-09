/**
 * POST /api/orders/[id]/refund
 * Request a refund for a delivered order (customer side)
 *
 * Path params:
 *   - id: string (order_id)
 *
 * Body:
 *   - reason: string (required) - Reason for refund
 *   - message: string (optional) - Additional details
 *
 * Validations:
 *   - Order must be 'delivered' status
 *   - Order must belong to the logged-in user
 *   - No existing pending refund for this order
 *   - Creates refund record with 'pending' status
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

    // ✅ Step 3: Parse and validate request body
    const body = await readBody(event)

    if (!body?.reason) {
      return errorResponse(event, 400, 'Refund reason is required')
    }

    const validReasons = [
      'product_damaged',
      'wrong_item',
      'not_as_described',
      'quality_issue',
      'changed_mind',
      'other',
    ]

    const reason = body.reason.trim()
    const message = body.message?.trim() || null

    if (!validReasons.includes(reason)) {
      return errorResponse(event, 400, 'Invalid refund reason')
    }

    // ✅ Step 4: Fetch order with transaction and invoice details
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_id,
        status,
        user_id,
        total_amount,
        transactions(id, transaction_id, amount),
        invoices(id, invoice_id, total, status)
      `)
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !order) {
      console.error('[refund-request] Order not found:', fetchError)
      return errorResponse(event, 404, 'Order not found')
    }

    // ✅ Step 5: Validate order status (only delivered orders can be refunded)
    if (order.status !== 'delivered') {
      return errorResponse(event, 400, `Refunds can only be requested for delivered orders. Current status: ${order.status}`)
    }

    // ✅ Step 6: Get the first invoice and transaction
    const transactions = order.transactions || []
    const invoices = order.invoices || []

    const transaction = transactions[0]
    const invoice = invoices[0]

    if (!invoice) {
      return errorResponse(event, 400, 'No invoice found for this order')
    }

    // ✅ Step 7: Check if a pending refund already exists for this invoice
    const { data: existingRefund, error: existingRefundError } = await supabaseAdmin
      .from('refunds')
      .select('id, status')
      .eq('invoice_id', invoice.id)
      .in('status', ['pending'])
      .single()

    if (existingRefund && !existingRefundError) {
      return errorResponse(event, 400, 'A refund request already exists for this order')
    }

    // ✅ Step 8: Generate unique refund ID
    const refundId = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // Map reason to human-readable text
    const reasonMap: Record<string, string> = {
      product_damaged: 'Product arrived damaged',
      wrong_item: 'Received wrong item',
      not_as_described: 'Product not as described',
      quality_issue: 'Quality not as expected',
      changed_mind: 'Changed my mind',
      other: 'Other reason',
    }

    // ✅ Step 9: Create refund record
    const { data: refund, error: insertError } = await supabaseAdmin
      .from('refunds')
      .insert({
        invoice_id: invoice.id,
        transaction_id: transaction?.id || null,
        refund_id: refundId,
        amount: invoice.total || order.total_amount,
        reason: `${reasonMap[reason]}${message ? ` - ${message}` : ''}`,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('[refund-request] Insert error:', insertError.message)
      return errorResponse(event, 500, 'Failed to create refund request')
    }

    // ✅ Step 10: Return success response
    return successResponse(event, 201, {
      message: 'Refund request submitted successfully',
      data: {
        refund_id: refund.refund_id,
        amount: refund.amount,
        status: refund.status,
        order_id: orderId,
      },
    })
  }
  catch (error: any) {
    // ✅ Error handling
    console.error('[refund-request] Error creating refund request:', error)

    if (error?.statusCode === 401) {
      return errorResponse(event, 401, 'Unauthorized - Please login')
    }

    if (error?.message?.includes('permissions')) {
      return errorResponse(event, 403, 'Permission denied')
    }

    if (error?.statusCode === 400) {
      return errorResponse(event, 400, error.message)
    }

    if (error?.statusCode === 404) {
      return errorResponse(event, 404, error.message)
    }

    return errorResponse(event, 500, 'Failed to submit refund request')
  }
})