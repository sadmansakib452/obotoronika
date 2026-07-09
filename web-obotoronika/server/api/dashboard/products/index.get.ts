import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { productsQuerySchema } from '~~/server/utils/query'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, ['super_admin', 'admin', 'manager', 'seller'])

    const query = getQuery(event)
    const validatedQuery = productsQuerySchema.parse(query)

    const { page, perPage, q, filterBy, sort, order } = validatedQuery

    let supabaseQuery = supabaseAdmin.from('products').select(`
        id,
        title,
        sku,
        price,
        initial_stock,
        current_stock,
        low_stock_alert,
        status,
        thumbnail,
        slug,
        merchant:merchants(name),
        category:categories(name)
      `, { count: 'exact' })

    if (user.user_metadata.role !== 'admin' && user.user_metadata.role !== 'super_admin' && user.user_metadata.merchant_id) {
      supabaseQuery = supabaseQuery.eq('merchant_id', user.user_metadata.merchant_id)
    }

    if (q) {
      supabaseQuery = supabaseQuery.ilike('title', `%${q}%`)
    }

    const advanceFilter: any = JSON.parse(filterBy ?? '{}')

    if (advanceFilter?.status) {
      supabaseQuery = supabaseQuery.eq('status', advanceFilter.status)
    }
    if (advanceFilter?.category) {
      supabaseQuery = supabaseQuery.eq('category_id', Number(advanceFilter?.category))
    }

    supabaseQuery = supabaseQuery
      .order(sort, { ascending: order === 'asc' })
      .range((page - 1) * perPage, page * perPage - 1)

    // Execute the query
    const { data, error, count } = await supabaseQuery

    if (error) throw new Error(error.message)

    return successResponse(event, 200, {
      products: data,
      meta: {
        total: count || 0,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage),
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
