/**
 * Refunds API - Chapter 7 Step 7.1
 * POST /api/refunds/:id/process
 *
 * Purpose: Process refund for an approved return request
 *          This triggers the SSLCommerz refund API
 *
 * Path Parameters:
 *   - id: Return request ID
 *
 * Request Body:
 *   - amount?: Custom refund amount (optional, defaults to calculated amount)
 *   - remarks?: Custom refund remarks (optional)
 */

import type { H3Event } from 'h3'
import { RefundManager } from '~~/server/utils/refund/RefundManager'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
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

    // 3. Parse request body
    const body = await readBody(event)
    const customAmount = body?.amount ? parseFloat(body.amount) : undefined
    const customRemarks = body?.remarks as string | undefined

    // Validate custom amount if provided
    if (customAmount !== undefined && (isNaN(customAmount) || customAmount <= 0)) {
      return errorResponse(event, 400, 'Invalid amount. Must be a positive number.')
    }

    // 4. Process refund using RefundManager
    const refundManager = new RefundManager()
    const result = await refundManager.processRefund(returnRequestId, customAmount, customRemarks)

    // 5. Check result and return appropriate response
    if (result.success) {
      return successResponse(event, 200, {
        success: true,
        refund_ref_id: result.refund_ref_id,
        bank_tran_id: result.bank_tran_id,
        status: result.status,
        message: 'Refund processed successfully! Customer will receive the amount in 3-7 business days.',
      })
    }
    else {
      return errorResponse(event, 400, {
        success: false,
        error: result.error,
        message: result.message || 'Failed to process refund',
      })
    }
  }
  catch (error: any) {
    console.error('[Refunds :id process POST] Error:', error)

    // Handle specific error messages
    if (error.message.includes('not found')) {
      return errorResponse(event, 404, 'Return request not found')
    }

    if (error.message.includes('Cannot process')) {
      return errorResponse(event, 400, error.message)
    }

    if (error.message.includes('not enabled')) {
      return errorResponse(event, 503, 'Refund processing is currently disabled')
    }

    if (error.message.includes('Original transaction not found')) {
      return errorResponse(event, 400, 'Original payment transaction not found. Cannot process refund.')
    }

    if (error.message.includes('exceeds original payment')) {
      return errorResponse(event, 400, 'Refund amount cannot exceed original payment amount')
    }

    return errorResponse(
      event,
      error?.statusCode || 500,
      error?.message || 'Failed to process refund',
    )
  }
})
