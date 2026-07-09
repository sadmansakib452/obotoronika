/**
 * Returns API - Chapter 5 Step 5.1
 * POST /api/returns
 *
 * Purpose: Create a new return or cancellation request
 *
 * Request Body:
 * {
 *   order_id: number,
 *   type: "cancellation" | "return",
 *   reason: string,
 *   description?: string,
 *   images?: string[],
 *   refund_method?: "original_payment" | "store_credit"
 * }
 */

import type { H3Event } from 'h3'
import { RefundManager } from '~~/server/utils/refund/RefundManager'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { checkUserRole } from '~~/server/utils/checkUserRole'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // 1. Check authentication
    const supabase = await getServerSupabase(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse(event, 401, 'Unauthorized - Please login')
    }

    // 2. Parse and validate request body
    const body = await readBody(event)

    // Required fields validation
    if (!body.order_id) {
      return errorResponse(event, 400, 'order_id is required')
    }
    if (!body.type || !['cancellation', 'return'].includes(body.type)) {
      return errorResponse(event, 400, 'type is required and must be "cancellation" or "return"')
    }
    if (!body.reason || body.reason.trim().length === 0) {
      return errorResponse(event, 400, 'reason is required')
    }

    // 3. Initialize RefundManager and create return request
    const refundManager = new RefundManager()

    const returnRequest = await refundManager.createReturnRequest(
      {
        order_id: body.order_id,
        type: body.type,
        reason: body.reason,
        description: body.description || undefined,
        images: body.images || undefined,
        refund_method: body.refund_method || 'original_payment',
      },
      user.id,
    )

    // 4. Return success response
    return successResponse(event, 201, {
      return_request: returnRequest,
      message: `Return request created successfully. Request ID: ${returnRequest.id}`,
    })
  }
  catch (error: any) {
    console.error('[Returns POST] Error:', error)

    // Handle specific error messages
    if (error.message.includes('You do not own this order')) {
      return errorResponse(event, 403, 'You do not have permission to request return for this order')
    }

    if (error.message.includes('already exists')) {
      return errorResponse(event, 409, error.message)
    }

    if (error.message.includes('does not allow')) {
      return errorResponse(event, 400, error.message)
    }

    return errorResponse(
      event,
      error?.statusCode || 500,
      error?.message || 'Failed to create return request',
    )
  }
})
