/**
 * GET /api/dashboard/finance/refunds/[id]
 * Fetch single refund details by ID
 *
 * Path params:
 *   - id: number (refund ID)
 */

import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

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

    // ✅ Step 3: Fetch refund details using RPC
    const { data: refundDetails, error: refundError } = await supabaseAdmin.rpc('get_refund_details', {
      p_refund_id: refundId,
    })

    if (refundError) {
      console.error('[refunds] Error fetching refund details:', refundError.message)
      throw new Error(refundError.message)
    }

    // ✅ Step 4: Check if refund exists
    if (!refundDetails || refundDetails.length === 0) {
      return errorResponse(event, 404, 'Refund not found')
    }

    // ✅ Step 5: Return success response
    return successResponse(event, 200, {
      data: refundDetails[0],
    })
  }
  catch (error: any) {
    // ✅ Error handling
    console.error('[refunds] Error fetching refund details:', error)

    if (error?.statusCode === 401) {
      return errorResponse(event, 401, 'Unauthorized - Admin access required')
    }

    if (error?.message?.includes('permissions')) {
      return errorResponse(event, 403, 'Permission denied')
    }

    if (error?.statusCode === 404) {
      return errorResponse(event, 404, 'Refund not found')
    }

    return errorResponse(event, 500, 'Failed to fetch refund details')
  }
})