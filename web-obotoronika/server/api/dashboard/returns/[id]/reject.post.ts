/**
 * Dashboard Returns API - Chapter 6 Step 6.3
 * POST /api/dashboard/returns/:id/reject
 *
 * Purpose: Admin rejects a return request
 *          Customer will be notified of the rejection
 *
 * Path Parameters:
 *   - id: Return request ID
 *
 * Request Body:
 *   - reason: Required - Reason for rejection
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

    // Validate reason is required
    if (!body.reason || body.reason.trim().length === 0) {
      return errorResponse(event, 400, 'Rejection reason is required')
    }

    // 4. Use RefundManager to reject
    const refundManager = new RefundManager()
    const rejectedRequest = await refundManager.rejectReturn(returnRequestId, user.id, body.reason)

    // 5. Return success response
    return successResponse(event, 200, {
      return_request: rejectedRequest,
      message: `Return request #${returnRequestId} has been rejected. Customer will be notified.`,
    })
  }
  catch (error: any) {
    console.error('[Dashboard Returns :id reject POST] Error:', error)

    // Handle specific error messages
    if (error.message.includes('not found')) {
      return errorResponse(event, 404, 'Return request not found')
    }

    if (error.message.includes('Cannot reject')) {
      return errorResponse(event, 400, error.message)
    }

    return errorResponse(
      event,
      error?.statusCode || 500,
      error?.message || 'Failed to reject return request',
    )
  }
})
