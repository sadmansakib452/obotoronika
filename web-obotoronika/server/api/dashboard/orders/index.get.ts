import type { H3Event } from 'h3'
// import { ordersQuerySchema } from '@@/server/utils/query'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, ['super_admin', 'admin', 'seller', 'manager'])

    // const { page, perPage, q, filterBy, sort, order } = validatedQuery

    const { page = 1, perPage = 10, status, fromDate, toDate } = getQuery(event)
    const pageNumber = Number(page)
    const pageSize = Number(perPage)
    const from = (pageNumber - 1) * pageSize
    const to = from + pageSize - 1

    const role = user.user_metadata?.role || ''
    const merchantId = user.user_metadata?.merchant_id

    let supabaseQuery = supabaseAdmin
      .from('merchant_order_view')
      .select('*', { count: 'exact' })
      .order('merchant_order_created_at', { ascending: false })

    // Sellers see only their own merchant orders — admins see all
    if (role === 'seller' && merchantId) {
      supabaseQuery = supabaseQuery.eq('merchant_id', merchantId)
    }

    // Filter by status
    if (status) {
      supabaseQuery = supabaseQuery.eq('merchant_order_status', status)
    }

    // Filter by date range
    if (fromDate && toDate) {
      supabaseQuery = supabaseQuery
        .gte('merchant_order_created_at', fromDate)
        .lte('merchant_order_created_at', toDate)
    }
    else if (fromDate) {
      supabaseQuery = supabaseQuery.gte('merchant_order_created_at', fromDate)
    }
    else if (toDate) {
      supabaseQuery = supabaseQuery.lte('merchant_order_created_at', toDate)
    }

    // Apply pagination
    supabaseQuery = supabaseQuery.range(from, to)

    const { data, count, error } = await supabaseQuery

    if (error) {
      return errorResponse(event, 500, error.message)
    }

    const seen = new Set()
    const uniqueMerchantOrders = data.filter((row: any) => {
      if (seen.has(row.external_order_id)) return false
      seen.add(row.external_order_id)
      return true
    })

    return successResponse(event, 200, {
      orders: uniqueMerchantOrders,
      meta: {
        total: count,
        page: pageNumber,
        perPage: pageSize,
        totalPages: Math.ceil(count || 0 / pageSize),
      },
    })
  }
  catch (error: any) {
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('got error from get all merchants API.', error)
    return errorResponse(event, error?.statusCode || 500, error.message)
  }
})
