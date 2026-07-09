/**
 * GET /api/dashboard/finance/refunds
 * Fetch paginated list of refund requests
 *
 * Query params:
 *   - page: number (default: 1)
 *   - perPage: number (default: 10)
 *   - q: string (search query)
 *   - status: string (filter by status)
 */

import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

// Query validation schema
const refundsQuerySchema = {
  page: {
    type: 'number',
    default: 1,
  },
  perPage: {
    type: 'number',
    default: 10,
  },
  q: {
    type: 'string',
    required: false,
  },
  status: {
    type: 'string',
    required: false,
  },
  type: {
    type: 'string',
    required: false,
  },
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    // ✅ Step 1: Check user role - only admin/manager can view refunds
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    // ✅ Step 2: Parse and validate query params
    const query = getQuery(event)

    // Validate and set defaults
    const page = Math.max(1, parseInt(String(query.page)) || 1)
    const perPage = Math.min(50, Math.max(1, parseInt(String(query.perPage)) || 10))
    const search = typeof query.q === 'string' ? query.q.trim() || null : null
    const status = typeof query.status === 'string' ? query.status.trim() || null : null

    const offset = (page - 1) * perPage

    // ✅ Step 3: Fetch paginated refunds list using RPC
    const { data: refunds, error: refundsError } = await supabaseAdmin.rpc('get_refunds_list', {
      p_search: search,
      p_status: status,
      p_limit: perPage,
      p_offset: offset,
    })

    if (refundsError) {
      console.error('[refunds] RPC error:', refundsError.message)
      throw new Error(refundsError.message)
    }

    // ✅ Step 4: Get total count for pagination
    const { data: countData, error: countError } = await supabaseAdmin.rpc('get_refunds_count', {
      p_search: search,
      p_status: status,
    })

    if (countError) {
      console.error('[refunds] Count RPC error:', countError.message)
      throw new Error(countError.message)
    }

    const total = countData?.[0]?.count || 0

    // ✅ Step 5: Return success response
    return successResponse(event, 200, {
      data: refunds || [],
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    })
  }
  catch (error: any) {
    // ✅ Error handling
    console.error('[refunds] Error fetching refunds list:', error)

    if (error?.statusCode === 401) {
      return errorResponse(event, 401, 'Unauthorized - Admin access required')
    }

    if (error?.message?.includes('permissions')) {
      return errorResponse(event, 403, 'Permission denied')
    }

    if (error?.statusCode === 400) {
      return errorResponse(event, 400, error.message)
    }

    return errorResponse(event, 500, 'Failed to fetch refunds')
  }
})