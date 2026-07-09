import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { transactionsQuerySchema } from '~~/server/utils/query'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)

    // ✅ Check role
    const user = await checkUserRole(supabase, ['super_admin', 'admin', 'manager', 'seller'])

    // ✅ Parse and validate query
    const query = getQuery(event)
    const validatedQuery = transactionsQuerySchema.parse(query)
    const { page, perPage, q } = validatedQuery

    const offset = (page - 1) * perPage
    const search = q || null

    // ✅ RPC to get paginated data
    const { data, error } = await supabaseAdmin.rpc('get_merchant_transactions', {
      p_merchant_id: user.user_metadata.merchant_id,
      p_search: search,
      p_limit: perPage,
      p_offset: offset,
    })

    if (error) throw new Error(error.message)

    // ✅ Count query for total
    const { data: countData, error: countError } = await supabaseAdmin.rpc('get_merchant_transactions_count', {
      p_merchant_id: user.user_metadata.merchant_id,
      p_search: search,
    })

    if (countError) throw new Error(countError.message)

    const total = countData[0].count || 0

    return successResponse(event, 200, {
      data,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    })
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')

    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')

    console.error('Error fetching transactions:', error)
    return errorResponse(event, 500, error.message)
  }
})
