/**
 * GET /api/dashboard/finance/cancellations
 * Fetch paginated list of cancellation requests (admin side)
 *
 * Only accessible by: super_admin, admin, manager
 *
 * Query params:
 *   - page: number (default: 1)
 *   - perPage: number (default: 10, max: 50)
 *   - status: string (filter: pending | approved | rejected)
 *   - q: string (search by order_id or refund_id)
 */

import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // ✅ Step 1: Authenticate as admin
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    // ✅ Step 2: Parse query params
    const query = getQuery(event)
    const page = Math.max(1, parseInt(String(query.page)) || 1)
    const perPage = Math.min(50, Math.max(1, parseInt(String(query.perPage)) || 10))
    const status = typeof query.status === 'string' ? query.status.trim() || null : null
    const search = typeof query.q === 'string' ? query.q.trim() || null : null

    const offset = (page - 1) * perPage

    // ✅ Step 3: Build query
    let dbQuery = supabaseAdmin
      .from('refunds')
      .select(`
        id,
        refund_id,
        amount,
        reason,
        status,
        refund_type,
        admin_note,
        created_at,
        updated_at,
        orders!inner(
          id,
          order_id,
          status,
          total_amount,
          payment_method,
          user_id
        )
      `, { count: 'exact' })
      .eq('refund_type', 'cancellation')
      .order('created_at', { ascending: false })

    if (status) {
      dbQuery = dbQuery.eq('status', status)
    }

    if (search) {
      dbQuery = dbQuery.or(
        `orders.order_id.ilike.%${search}%,refund_id.ilike.%${search}%`
      )
    }

    const { data: cancellations, error, count } = await dbQuery
      .range(offset, offset + perPage - 1)

    if (error) {
      console.error('[admin cancellations] Query error:', error.message)
      throw new Error(error.message)
    }

    // ✅ Step 4: Extract user IDs and fetch customer info
    const userIds = [
      ...new Set((cancellations ?? []).map((c: any) => c.orders?.user_id).filter(Boolean)),
    ]

    const { data: users } = await supabaseAdmin
      .from('extended_users')
      .select('id, email, phone, raw_user_meta_data->>name')
      .in('id', userIds)

    const userMap = new Map((users ?? []).map((u: any) => [u.id, u]))

    // ✅ Step 5: Format response
    const data = (cancellations ?? []).map((cancellation: any) => {
      const order = cancellation.orders || {}
      const customer = userMap.get(order.user_id)

      return {
        id: cancellation.id,
        refund_id: cancellation.refund_id,
        amount: cancellation.amount,
        reason: cancellation.reason,
        status: cancellation.status,
        admin_note: cancellation.admin_note,
        created_at: cancellation.created_at,
        updated_at: cancellation.updated_at,
        order: order.order_id
          ? {
              order_id: order.order_id,
              status: order.status,
              total_amount: order.total_amount,
              payment_method: order.payment_method,
            }
          : null,
        customer: customer
          ? {
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
            }
          : null,
      }
    })

    return successResponse(event, 200, {
      data,
      meta: {
        total: count || 0,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      },
    })
  }
  catch (error: any) {
    console.error('[admin cancellations] Error:', error)

    if (error?.statusCode === 401) {
      return errorResponse(event, 401, 'Unauthorized - Admin access required')
    }

    if (error?.message?.includes('permissions')) {
      return errorResponse(event, 403, 'Permission denied')
    }

    return errorResponse(event, 500, 'Failed to fetch cancellation requests')
  }
})
