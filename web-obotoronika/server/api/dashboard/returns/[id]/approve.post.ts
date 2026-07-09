/**
 * Dashboard Returns API - Chapter 6 Step 6.2
 * POST /api/dashboard/returns/:id/approve
 *
 * Purpose: Admin approves a return request
 *          After approval, refund can be processed
 *
 * Path Parameters:
 *   - id: Return request ID
 *
 * Request Body:
 *   - notes?: Optional admin notes
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
    const notes = body?.notes as string | undefined

    // 4. Use RefundManager to approve
    const refundManager = new RefundManager()
    const approvedRequest = await refundManager.approveReturn(returnRequestId, user.id, notes)

    // 5. Return success response
    return successResponse(event, 200, {
      return_request: approvedRequest,
      message: `Return request #${returnRequestId} approved successfully. You can now process the refund.`,
    })
  }
  catch (error: any) {
    console.error('[Dashboard Returns :id approve POST] Error:', error)

    // Handle specific error messages
    if (error.message.includes('not found')) {
      return errorResponse(event, 404, 'Return request not found')
    }

    if (error.message.includes('Cannot approve')) {
      return errorResponse(event, 400, error.message)
    }

    return errorResponse(
      event,
      error?.statusCode || 500,
      error?.message || 'Failed to approve return request',
    )
  }
})
