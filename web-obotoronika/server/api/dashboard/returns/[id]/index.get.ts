/**
 * Dashboard Returns API - Chapter 6 Step 6.3 (additional)
 * GET /api/dashboard/returns/:id
 *
 * Purpose: Admin endpoint to get detailed return request information
 *          Includes more details than the customer endpoint
 *
 * Path Parameters:
 *   - id: Return request ID
 */

import type { H3Event } from 'h3'
import { RefundManager } from '~~/server/utils/refund/RefundManager'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import supabaseAdmin from '~~/server/utils/supabaseAdmin'
import checkUserRole from '~~/server/utils/checkUserRole'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // 1. Check authentication and admin role
    const supabase = await getServerSupabase(event)

    // Use checkUserRole for proper role validation from user_metadata
    const user = await checkUserRole(supabase, ['super_admin', 'admin'])

    // 2. Get return request ID from path
    const returnId = getRouterParam(event, 'id')

    if (!returnId || isNaN(parseInt(returnId))) {
      return errorResponse(event, 400, 'Invalid return request ID')
    }

    const returnRequestId = parseInt(returnId)

    // 3. Fetch return request with full details
    const { data: returnRequest, error } = await supabaseAdmin
      .from('return_requests')
      .select(`
        *,
        orders(*),
        profiles!user_id(email, full_name, phone),
        profiles!processed_by(full_name)
      `)
      .eq('id', returnRequestId)
      .single()

    if (error || !returnRequest) {
      return errorResponse(event, 404, 'Return request not found')
    }

    // 4. Fetch original transaction for refund reference
    const { data: transaction } = await supabaseAdmin
      .from('transactions')
      .select('id, tran_id, bank_tran_id, amount, card_type, card_no, status')
      .eq('tran_id', returnRequest.orders?.order_id)
      .eq('status', 'success')
      .single()

    // 5. Format response
    return successResponse(event, 200, {
      return_request: {
        id: returnRequest.id,
        order_id: returnRequest.order_id,
        type: returnRequest.type,
        status: returnRequest.status,
        reason: returnRequest.reason,
        description: returnRequest.description,
        images: returnRequest.images,
        refund_amount: returnRequest.refund_amount,
        method: returnRequest.method,
        admin_notes: returnRequest.admin_notes,
        created_at: returnRequest.created_at,
        updated_at: returnRequest.updated_at,
        processed_at: returnRequest.processed_at,
        // Order details
        order: returnRequest.orders
          ? {
              id: returnRequest.orders.id,
              order_id: returnRequest.orders.order_id,
              total_amount: returnRequest.orders.total_amount,
              status: returnRequest.orders.status,
              payment_method: returnRequest.orders.payment_method,
              created_at: returnRequest.orders.created_at,
              shipping_address: returnRequest.orders.shipping_address,
            }
          : null,
        // Customer details
        customer: {
          id: returnRequest.user_id,
          email: returnRequest.profiles?.email,
          full_name: returnRequest.profiles?.full_name,
          phone: returnRequest.profiles?.phone,
        },
        // Processed by admin
        processed_by_admin: returnRequest.processed_by
          ? {
              id: returnRequest.processed_by,
              name: returnRequest.profiles_2?.full_name,
            }
          : null,
        // Transaction for refund
        transaction: transaction
          ? {
              id: transaction.id,
              tran_id: transaction.tran_id,
              bank_tran_id: transaction.bank_tran_id,
              amount: transaction.amount,
              card_type: transaction.card_type,
              card_no: transaction.card_no,
            }
          : null,
      },
    })
  }
  catch (error: any) {
    console.error('[Dashboard Returns :id GET] Error:', error)
    return errorResponse(
      event,
      error?.statusCode || 500,
      error?.message || 'Failed to fetch return request details',
    )
  }
})
