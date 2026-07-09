/**
 * Dashboard Returns API - Chapter 6 Step 6.3 (additional)
 * POST /api/dashboard/returns/:id/mark-received
 *
 * Purpose: Admin marks return as "received" after product is returned
 *          This is an intermediate status between "approved" and "processing"
 *
 * Path Parameters:
 *   - id: Return request ID
 *
 * Request Body:
 *   - notes?: Optional notes about the received product condition
 */

import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import supabaseAdmin from '~~/server/utils/supabaseAdmin'
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

    // 4. Get current return request
    const { data: currentRequest, error: fetchError } = await supabaseAdmin
      .from('return_requests')
      .select('status')
      .eq('id', returnRequestId)
      .single()

    if (fetchError || !currentRequest) {
      return errorResponse(event, 404, 'Return request not found')
    }

    // 5. Validate status - can only mark as received if currently approved
    if (currentRequest.status !== 'approved') {
      return errorResponse(event, 400, `Cannot mark as received. Current status: ${currentRequest.status}. Must be 'approved' first.`)
    }

    // 6. Update status to received
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('return_requests')
      .update({
        status: 'received',
        admin_notes: notes ? `${currentRequest.admin_notes || ''}\n\nProduct received: ${notes}` : currentRequest.admin_notes,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', returnRequestId)
      .select()
      .single()

    if (updateError) {
      console.error('[Dashboard Returns mark-received POST] DB error:', updateError)
      return errorResponse(event, 500, 'Failed to update return status')
    }

    // 7. Return success response
    return successResponse(event, 200, {
      return_request: updated,
      message: 'Return request marked as received. You can now proceed with refund processing.',
    })
  }
  catch (error: any) {
    console.error('[Dashboard Returns mark-received POST] Error:', error)
    return errorResponse(
      event,
      error?.statusCode || 500,
      error?.message || 'Failed to mark return as received',
    )
  }
})
