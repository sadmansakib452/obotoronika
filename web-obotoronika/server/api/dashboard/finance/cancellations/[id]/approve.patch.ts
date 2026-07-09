/**
 * PATCH /api/dashboard/finance/cancellations/[id]/approve
 * Approve a cancellation request
 *
 * On approval:
 *   - Order is cancelled + stock restored (via RPC)
 *   - Online payments are refunded via SSLCommerz
 *   - COD orders are cancelled without financial refund
 *
 * Path params:
 *   - id: number (refunds.id)
 */

import type { H3Event } from 'h3'
import SSLCommerzPayment from '@@/server/ssl'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // ✅ Step 1: Authenticate as admin
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    // ✅ Step 2: Get cancellation ID from params
    const cancellationIdParam = getRouterParam(event, 'id')

    if (!cancellationIdParam) {
      return errorResponse(event, 400, 'Cancellation ID is required')
    }

    const cancellationId = parseInt(cancellationIdParam)

    if (isNaN(cancellationId)) {
      return errorResponse(event, 400, 'Invalid cancellation ID')
    }

    // ✅ Step 3: Fetch the cancellation request with order details
    const { data: cancellation, error: fetchError } = await supabaseAdmin
      .from('refunds')
      .select(`
        id,
        refund_id,
        status,
        amount,
        reason,
        refund_type,
        order_id,
        transaction_id,
        invoice_id
      `)
      .eq('id', cancellationId)
      .eq('refund_type', 'cancellation')
      .single()

    if (fetchError || !cancellation) {
      console.error('[cancellations] Cancellation not found:', fetchError?.message)
      return errorResponse(event, 404, 'Cancellation request not found')
    }

    // ✅ Step 4: Validate current status
    if (cancellation.status !== 'pending') {
      return errorResponse(event, 400,
        `Cancellation request cannot be approved. Current status is: ${cancellation.status}`,
      )
    }

    if (!cancellation.order_id) {
      return errorResponse(event, 400, 'No order associated with this cancellation request')
    }

    // ✅ Step 5: Fetch order details (payment method, etc.)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_id, payment_method, total_amount, status')
      .eq('id', cancellation.order_id)
      .single()

    if (orderError || !order) {
      console.error('[cancellations] Order not found:', orderError?.message)
      return errorResponse(event, 404, 'Associated order not found')
    }

    // ✅ Step 6: Cancel order and restore stock via RPC
    const { data: cancelResult, error: cancelError } = await supabaseAdmin.rpc(
      'cancel_order_and_restore_stock',
      { p_order_id: cancellation.order_id },
    )

    if (cancelError) {
      console.error('[cancellations] Failed to cancel order:', cancelError.message)
      return errorResponse(event, 500, 'Failed to cancel order and restore stock')
    }

    // Check if the RPC returned an error message (it returns TEXT)
    if (typeof cancelResult === 'string' && cancelResult.startsWith('Order is not eligible')) {
      console.error('[cancellations] Order eligibility error:', cancelResult)
      return errorResponse(event, 400, cancelResult)
    }

    console.log('[cancellations] Order cancelled successfully:', {
      order_id: order.order_id,
      result: cancelResult,
    })

    // ✅ Step 7: Handle SSLCommerz refund for online payments
    const isOnlinePayment = order.payment_method !== 'cod' && (
      order.payment_method !== null || cancellation.transaction_id !== null
    )
    let sslCommerzResponse = null

    console.log('[cancellations] Refund check:', {
      isOnlinePayment,
      payment_method: order.payment_method,
      transaction_id: cancellation.transaction_id,
      has_transaction: !!cancellation.transaction_id,
    })

    if (isOnlinePayment && cancellation.transaction_id) {
      const config = useRuntimeConfig()
      const storeId = config.STORE_ID
      const storePassword = config.STORE_PASSWORD

      if (storeId && storePassword) {
        // Fetch bank_tran_id from transaction payment_details
        const { data: transaction } = await supabaseAdmin
          .from('transactions')
          .select('transaction_id, payment_details')
          .eq('id', cancellation.transaction_id)
          .single()

        let bankTranId: string | null = null

        if (transaction?.payment_details) {
          const paymentDetails = transaction.payment_details as Record<string, any>
          bankTranId = paymentDetails?.ipn?.bank_tran_id
            || paymentDetails?.validation?.bank_tran_id
            || null
        }

        if (!bankTranId) {
          console.warn('[cancellations] No bank_tran_id found for order', order.order_id)
        }
        else {
          try {
            const sslcz = new SSLCommerzPayment(storeId, storePassword, false)

            const refundResponse = await sslcz.initiateRefund({
              refund_amount: parseFloat(String(cancellation.amount)),
              refund_remarks: 'Cancellation refund processed by admin',
              bank_tran_id: bankTranId,
              refund_trans_id: `CAN-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              refe_id: cancellation.refund_id,
            })

            sslCommerzResponse = refundResponse

            const isSuccess = refundResponse?.status?.toUpperCase() === 'SUCCESS'
              || refundResponse?.status === 'success'

            if (!isSuccess) {
              console.error('[cancellations] SSLCommerz refund failed:', refundResponse)
              return errorResponse(event, 400,
                `Refund gateway error: ${refundResponse?.failedreason || refundResponse?.errorReason || 'Unknown error'}`,
              )
            }

            console.log('[cancellations] SSLCommerz refund successful:', {
              refund_id: cancellation.refund_id,
              refund_ref_id: refundResponse.refund_ref_id,
            })
          }
          catch (sslError: any) {
            console.error('[cancellations] SSLCommerz API error:', sslError.message)
            return errorResponse(event, 500, 'Failed to process refund with payment gateway')
          }
        }
      }
    }

    // ✅ Step 8: Update refund status to approved via RPC
    const { data: updateResult, error: updateError } = await supabaseAdmin.rpc('update_refund_status', {
      p_refund_id: cancellationId,
      p_new_status: 'approved',
      p_admin_note: 'Cancellation approved. Order cancelled and stock restored.',
      p_updated_by: user.id,
    })

    if (updateError) {
      console.error('[cancellations] Database update error:', updateError.message)
      return errorResponse(event, 500, 'Failed to update cancellation status')
    }

    if (updateResult && typeof updateResult === 'object' && !updateResult.success) {
      return errorResponse(event, 400, updateResult.message || 'Failed to update cancellation status')
    }

    // ✅ Step 9: Return success
    return successResponse(event, 200, {
      message: 'Cancellation request approved successfully',
      data: {
        cancellation_id: cancellation.refund_id,
        status: 'approved',
        order_id: order.order_id,
        order_status: 'canceled',
        is_online_payment: isOnlinePayment,
        refund_processed: isOnlinePayment && sslCommerzResponse !== null,
        sslcommerz_response: sslCommerzResponse,
      },
    })
  }
  catch (error: any) {
    console.error('[cancellations] Error approving cancellation:', error)

    if (error?.statusCode === 401) {
      return errorResponse(event, 401, 'Unauthorized - Admin access required')
    }

    if (error?.message?.includes('permissions')) {
      return errorResponse(event, 403, 'Permission denied')
    }

    if (error?.statusCode === 400) {
      return errorResponse(event, 400, error.message)
    }

    return errorResponse(event, 500, 'Failed to approve cancellation request')
  }
})
