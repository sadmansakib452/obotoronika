/**
 * Returns API - Chapter 5 Step 5.3
 * GET /api/returns/:id
 *
 * Purpose: Get details of a specific return request
 *
 * Path Parameters:
 *   - id: Return request ID
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

    // 3. Check if user is admin (for admin access) or owner
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin'

    // 4. Fetch return request using RefundManager
    const refundManager = new RefundManager()
    const returnRequest = await refundManager.getReturnRequest(returnRequestId)

    if (!returnRequest) {
      return errorResponse(event, 404, 'Return request not found')
    }

    // 5. Check ownership (unless admin)
    if (!isAdmin && returnRequest.user_id !== user.id) {
      return errorResponse(event, 403, 'You do not have permission to view this return request')
    }

    // 6. Format response with order details
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
        // Include order details
        order: returnRequest.order
          ? {
              order_id: returnRequest.order?.order_id,
              total_amount: returnRequest.order?.total_amount,
              status: returnRequest.order?.status,
              created_at: returnRequest.order?.created_at,
            }
          : null,
      },
    })
  }
  catch (error: any) {
    console.error('[Returns :id GET] Error:', error)
    return errorResponse(
      event,
      error?.statusCode || 500,
      error?.message || 'Failed to fetch return request details',
    )
  }
})
