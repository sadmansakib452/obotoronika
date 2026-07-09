/**
 * Returns API - Chapter 5 Step 5.2
 * GET /api/returns
 *
 * Purpose: List return requests for the authenticated user
 *
 * Query Parameters:
 *   - status?: Filter by status (pending, approved, rejected, completed, etc.)
 *   - type?: Filter by type (cancellation, return)
 *   - page?: Page number (default: 1)
 *   - per_page?: Items per page (default: 10)
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

    // 2. Parse query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const perPage = parseInt(query.per_page as string) || 10
    const status = query.status as string | undefined
    const type = query.type as string | undefined

    // Validate pagination
    if (page < 1 || perPage < 1 || perPage > 50) {
      return errorResponse(event, 400, 'Invalid pagination parameters')
    }

    // Validate status filter
    const validStatuses = ['pending', 'approved', 'rejected', 'received', 'processing', 'completed', 'failed', 'withdrawn']
    if (status && !validStatuses.includes(status)) {
      return errorResponse(event, 400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    }

    // Validate type filter
    const validTypes = ['cancellation', 'return']
    if (type && !validTypes.includes(type)) {
      return errorResponse(event, 400, `Invalid type. Must be one of: ${validTypes.join(', ')}`)
    }

    // 3. Fetch return requests using RefundManager
    const refundManager = new RefundManager()

    const result = await refundManager.listReturnRequests({
      userId: user.id,
      status: status || undefined,
      type: type || undefined,
      page,
      perPage,
    })

    // 4. Format response
    const totalPages = Math.ceil(result.total / perPage)

    return successResponse(event, 200, {
      return_requests: result.data,
      meta: {
        total: result.total,
        page,
        perPage,
        totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    })
  }
  catch (error: any) {
    console.error('[Returns GET] Error:', error)
    return errorResponse(
      event,
      error?.statusCode || 500,
      error?.message || 'Failed to fetch return requests',
    )
  }
})
