/**
 * PATCH /api/dashboard/finance/refunds/[id]
 * Update refund status (approve or reject)
 *
 * Path params:
 *   - id: number (refund ID)
 *
 * Body:
 *   - status: 'approved' | 'rejected'
 *   - admin_note: string (optional)
 */

import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import SSLCommerzPayment from '@@/server/ssl'

// Request body validation schema
const updateRefundSchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['approved', 'rejected'],
    },
    admin_note: {
      type: 'string',
    },
  },
  required: ['status'],
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    // ✅ Step 1: Check user role
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    // ✅ Step 2: Get refund ID from params
    const refundIdParam = getRouterParam(event, 'id')

    if (!refundIdParam) {
      return errorResponse(event, 400, 'Refund ID is required')
    }

    const refundId = parseInt(refundIdParam)

    if (isNaN(refundId)) {
      return errorResponse(event, 400, 'Invalid refund ID')
    }

    // ✅ Step 3: Parse and validate request body
    const body = await readBody(event)

    if (!body || !body.status) {
      return errorResponse(event, 400, 'Status is required (approved or rejected)')
    }

    if (!['approved', 'rejected'].includes(body.status)) {
      return errorResponse(event, 400, 'Invalid status. Must be approved or rejected')
    }

    const adminNote = typeof body.admin_note === 'string' ? body.admin_note.trim() : null
    const newStatus = body.status

    // ✅ Step 4: Get runtime config for SSLCommerz
    const config = useRuntimeConfig()
    const storeId = config.STORE_ID
    const storePassword = config.STORE_PASSWORD

    // ✅ Step 5: Fetch current refund details for validation
    const { data: currentRefund, error: fetchError } = await supabaseAdmin
      .from('refunds')
      .select('*')
      .eq('id', refundId)
      .single()

    if (fetchError || !currentRefund) {
      console.error('[refunds] Error fetching refund:', fetchError?.message)
      return errorResponse(event, 404, 'Refund not found')
    }

    // ✅ Step 6: Validate current status (only pending can be updated)
    if (currentRefund.status !== 'pending') {
      return errorResponse(event, 400, `Refund cannot be updated. Current status is: ${currentRefund.status}`)
    }

    // ✅ Step 7: Fetch transaction details for SSLCommerz refund
    let bankTranId: string | null = null

    if (newStatus === 'approved' && currentRefund.transaction_id) {
      const { data: transaction } = await supabaseAdmin
        .from('transactions')
        .select('transaction_id, payment_details')
        .eq('id', currentRefund.transaction_id)
        .single()

      if (transaction?.payment_details) {
        const paymentDetails = transaction.payment_details as Record<string, any>
        // Look in ipn.bank_tran_id or validation.bank_tran_id
        bankTranId = paymentDetails?.ipn?.bank_tran_id
          || paymentDetails?.validation?.bank_tran_id
          || null

        console.log('[refunds] Payment details found:', {
          bank_tran_id: bankTranId,
          has_ipn: !!paymentDetails?.ipn,
          has_validation: !!paymentDetails?.validation
        })
      }
    }

    // ✅ Step 8: Call SSLCommerz API for refund (if approving)
    let sslCommerzResponse = null

    if (newStatus === 'approved' && storeId && storePassword) {
      try {
        if (!bankTranId) {
          console.warn('[refunds] No bank_tran_id found, skipping SSLCommerz call')
        }
        else {
          // Initialize SSLCommerz
          const sslcz = new SSLCommerzPayment(storeId, storePassword, false) // false = sandbox

          // Call initiate refund API
          const refundResponse = await sslcz.initiateRefund({
            refund_amount: parseFloat(String(currentRefund.amount)),
            refund_remarks: adminNote || 'Refund processed by admin',
            bank_tran_id: bankTranId,
            refund_trans_id: `REF-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // Unique refund transaction ID
            refe_id: currentRefund.refund_id,
          })

          sslCommerzResponse = refundResponse

          // Check if SSLCommerz returned success (uppercase or lowercase)
          const isSuccess = refundResponse?.status?.toUpperCase() === 'SUCCESS' || refundResponse?.status === 'success'

          if (!isSuccess) {
            console.error('[refunds] SSLCommerz refund failed:', refundResponse)
            return errorResponse(event, 400, `Refund gateway error: ${refundResponse?.failedreason || refundResponse?.errorReason || 'Unknown error'}`)
          }

          console.log('[refunds] SSLCommerz refund successful:', {
            refund_id: currentRefund.refund_id,
            refund_ref_id: refundResponse.refund_ref_id,
          })
        }
      }
      catch (sslError: any) {
        console.error('[refunds] SSLCommerz API error:', sslError.message)
        return errorResponse(event, 500, 'Failed to process refund with payment gateway')
      }
    }

    // ✅ Step 9: Update refund status in database using RPC
    const { data: updateResult, error: updateError } = await supabaseAdmin.rpc('update_refund_status', {
      p_refund_id: refundId,
      p_new_status: newStatus,
      p_admin_note: adminNote,
      p_updated_by: user.id,
    })

    if (updateError) {
      console.error('[refunds] Database update error:', updateError.message)
      return errorResponse(event, 500, 'Failed to update refund status')
    }

    // Check RPC result
    if (updateResult && typeof updateResult === 'object' && !updateResult.success) {
      return errorResponse(event, 400, updateResult.message || 'Failed to update refund status')
    }

    // ✅ Step 10: Return success response
    return successResponse(event, 200, {
      message: `Refund ${newStatus} successfully`,
      data: {
        refund_id: refundId,
        status: newStatus,
        admin_note: adminNote,
        sslcommerz_response: sslCommerzResponse,
      },
    })
  }
  catch (error: any) {
    // ✅ Error handling
    console.error('[refunds] Error updating refund status:', error)

    if (error?.statusCode === 401) {
      return errorResponse(event, 401, 'Unauthorized - Admin access required')
    }

    if (error?.message?.includes('permissions')) {
      return errorResponse(event, 403, 'Permission denied')
    }

    if (error?.statusCode === 400) {
      return errorResponse(event, 400, error.message)
    }

    return errorResponse(event, 500, 'Failed to update refund status')
  }
})