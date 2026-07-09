/**
 * Returns API - Chapter 5 Step 5.4
 * POST /api/returns/:id/withdraw
 *
 * Purpose: Allow customer to withdraw/cancel their return request
 *          Only possible when status is 'pending'
 *
 * Path Parameters:
 *   - id: Return request ID
 *
 * Request Body (optional):
 *   - reason: Reason for withdrawing
 */

import type { H3Event } from 'h3'
import { RefundManager } from '~~/server/utils/refund/RefundManager'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

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

    // 3. Use RefundManager to withdraw
    const refundManager = new RefundManager()
    const withdrawnRequest = await refundManager.withdrawReturn(returnRequestId, user.id)

    // 4. Return success response
    return successResponse(event, 200, {
      return_request: withdrawnRequest,
      message: 'Return request withdrawn successfully',
    })
  }
  catch (error: any) {
    console.error('[Returns :id withdraw POST] Error:', error)

    // Handle specific error messages
    if (error.message.includes('You do not own')) {
      return errorResponse(event, 403, 'You do not have permission to withdraw this return request')
    }

    if (error.message.includes('Cannot withdraw')) {
      return errorResponse(event, 400, error.message)
    }

    if (error.message.includes('not found')) {
      return errorResponse(event, 404, 'Return request not found')
    }

    return errorResponse(
      event,
      error?.statusCode || 500,
      error?.message || 'Failed to withdraw return request',
    )
  }
})
