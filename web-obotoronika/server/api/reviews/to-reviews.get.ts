import type { H3Event } from 'h3'
import { getQuery } from 'h3'
import { toReviewsSchema } from '@@/server/utils/query'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)

    const user = await checkUserRole(supabase, [
      'super_admin',
      'admin',
      'customer',
    ])

    const query = getQuery(event)
    const validatedQuery = toReviewsSchema.parse(query)
    const { page, perPage } = validatedQuery
    const offset = (page - 1) * perPage

    // Call RPC to get paginated reviewable products
    const { data, error: ordersError } = await supabaseAdmin.rpc(
      'get_reviewable_products_paginated',
      {
        _user_id: user.id,
        _limit: perPage,
        _offset: offset,
      },
    )

    if (ordersError) throw ordersError

    // Call RPC to get total count
    const { data: count, error: countError } = await supabaseAdmin.rpc(
      'count_reviewable_products',
      {
        _user_id: user.id,
      },
    )

    if (countError) throw countError

    return successResponse(event, 200, {
      data: data,
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

    console.error('Error in getReviewableProducts:', error)
    return errorResponse(event, error?.statusCode || 500, error.message)
  }
})
