/**
 * Dashboard Returns API - Chapter 6 Step 6.1
 * GET /api/dashboard/returns
 *
 * Purpose: Admin endpoint to list all return requests with filters
 *
 * Query Parameters:
 *   - status?: Filter by status
 *   - type?: Filter by type (cancellation, return)
 *   - page?: Page number (default: 1)
 *   - per_page?: Items per page (default: 15)
 *   - search?: Search by order_id or user email
 *   - date_from?: Filter from date (YYYY-MM-DD)
 *   - date_to?: Filter to date (YYYY-MM-DD)
 */

import type { H3Event } from 'h3'
import supabaseAdmin from '~~/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import checkUserRole from '~~/server/utils/checkUserRole'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // 1. Check authentication and admin role
    const supabase = await getServerSupabase(event)

    // Use checkUserRole for proper role validation from user_metadata
    const user = await checkUserRole(supabase, ['super_admin', 'admin'])

    // 2. Parse query parameters
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const perPage = parseInt(query.per_page as string) || 15
    const status = query.status as string | undefined
    const type = query.type as string | undefined
    const search = query.search as string | undefined
    const dateFrom = query.date_from as string | undefined
    const dateTo = query.date_to as string | undefined

    // Validate pagination
    if (page < 1 || perPage < 1 || perPage > 100) {
      return errorResponse(event, 400, 'Invalid pagination parameters')
    }

    // Validate status filter
    const validStatuses = ['pending', 'approved', 'rejected', 'received', 'processing', 'completed', 'failed', 'withdrawn']
    if (status && !validStatuses.includes(status)) {
      return errorResponse(event, 400, `Invalid status`)
    }

    // Validate type filter
    const validTypes = ['cancellation', 'return']
    if (type && !validTypes.includes(type)) {
      return errorResponse(event, 400, `Invalid type`)
    }

    // 3. Build query with filters
    let queryBuilder = supabaseAdmin
      .from('return_requests')
      .select('*', { count: 'exact' })

    // Apply filters
    if (status) {
      queryBuilder = queryBuilder.eq('status', status)
    }

    if (type) {
      queryBuilder = queryBuilder.eq('type', type)
    }

    if (search) {
      // Search in order_id
      queryBuilder = queryBuilder.ilike('order_id', `%${search}%`)
    }

    if (dateFrom) {
      queryBuilder = queryBuilder.gte('created_at', dateFrom)
    }

    if (dateTo) {
      queryBuilder = queryBuilder.lte('created_at', dateTo + ' 23:59:59')
    }

    // Apply pagination and ordering
    const offset = (page - 1) * perPage
    queryBuilder = queryBuilder.range(offset, offset + perPage - 1)
    queryBuilder = queryBuilder.order('created_at', { ascending: false })

    // 4. Execute query
    const { data: returnRequests, count, error } = await queryBuilder

    if (error) {
      console.error('[Dashboard Returns GET] DB error:', error)
      return errorResponse(event, 500, 'Failed to fetch return requests')
    }

    // 5. Get statistics
    let stats = null
    try {
      const { data: statsData } = await supabaseAdmin.rpc('fn_get_return_stats')
      stats = statsData
    }
    catch (e) {
      console.warn('[Dashboard Returns GET] Could not fetch stats:', e)
    }

    // 6. Format response
    const totalPages = Math.ceil((count || 0) / perPage)

    const formattedRequests = (returnRequests || []).map((rr: any) => ({
      id: rr.id,
      order_id: rr.order_id,
      type: rr.type,
      status: rr.status,
      reason: rr.reason,
      description: rr.description,
      refund_amount: rr.refund_amount,
      method: rr.method,
      user_id: rr.user_id,
      admin_notes: rr.admin_notes,
      processed_by: rr.processed_by,
      processed_at: rr.processed_at,
      refund_id: rr.refund_id,
      created_at: rr.created_at,
      updated_at: rr.updated_at,
    }))

    return successResponse(event, 200, {
      return_requests: formattedRequests,
      stats: stats?.[0] || {
        total_requests: 0,
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
        completed_count: 0,
        total_refund_amount: 0,
      },
      meta: {
        total: count || 0,
        page,
        perPage,
        totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    })
  }
  catch (error: any) {
    console.error('[Dashboard Returns GET] Error:', error)
    return errorResponse(
      event,
      error?.statusCode || 500,
      error?.message || 'Failed to fetch return requests',
    )
  }
})
