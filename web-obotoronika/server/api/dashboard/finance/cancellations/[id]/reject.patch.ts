/**
 * PATCH /api/dashboard/finance/cancellations/[id]/reject
 * Reject a cancellation request
 *
 * Path params:
 *   - id: number (refunds.id)
 *
 * Body:
 *   - admin_note: string (optional reason for rejection)
 */

import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // ✅ Step 1: Authenticate as admin
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    // ✅ Step 2: Get cancellation ID from params
    const cancellationIdParam = getRouterParam(event, 'id')

    if (!cancellationIdParam) {
      return errorResponse(event, 400, 'Cancellation ID is required')
    }

    const cancellationId = parseInt(cancellationIdParam)

    if (isNaN(cancellationId)) {
      return errorResponse(event, 400, 'Invalid cancellation ID')
    }

    // ✅ Step 3: Parse optional admin note
    const body = await readBody(event).catch(() => ({}))
    const adminNote = typeof body?.admin_note === 'string' ? body.admin_note.trim() : null

    // ✅ Step 4: Fetch the cancellation request
    const { data: cancellation, error: fetchError } = await supabaseAdmin
      .from('refunds')
      .select('id, refund_id, status, refund_type')
      .eq('id', cancellationId)
      .eq('refund_type', 'cancellation')
      .single()

    if (fetchError || !cancellation) {
      console.error('[cancellations] Cancellation not found:', fetchError?.message)
      return errorResponse(event, 404, 'Cancellation request not found')
    }

    // ✅ Step 5: Validate current status
    if (cancellation.status !== 'pending') {
      return errorResponse(event, 400,
        `Cancellation request cannot be rejected. Current status is: ${cancellation.status}`
      )
    }

    // ✅ Step 6: Update refund status to rejected via RPC
    const { data: updateResult, error: updateError } = await supabaseAdmin.rpc('update_refund_status', {
      p_refund_id: cancellationId,
      p_new_status: 'rejected',
      p_admin_note: adminNote,
      p_updated_by: user.id,
    })

    if (updateError) {
      console.error('[cancellations] Database update error:', updateError.message)
      return errorResponse(event, 500, 'Failed to reject cancellation request')
    }

    if (updateResult && typeof updateResult === 'object' && !updateResult.success) {
      return errorResponse(event, 400, updateResult.message || 'Failed to reject cancellation request')
    }

    // ✅ Step 7: Return success
    return successResponse(event, 200, {
      message: 'Cancellation request rejected',
      data: {
        cancellation_id: cancellation.refund_id,
        status: 'rejected',
        admin_note: adminNote,
      },
    })
  }
  catch (error: any) {
    console.error('[cancellations] Error rejecting cancellation:', error)

    if (error?.statusCode === 401) {
      return errorResponse(event, 401, 'Unauthorized - Admin access required')
    }

    if (error?.message?.includes('permissions')) {
      return errorResponse(event, 403, 'Permission denied')
    }

    if (error?.statusCode === 400) {
      return errorResponse(event, 400, error.message)
    }

    return errorResponse(event, 500, 'Failed to reject cancellation request')
  }
})
