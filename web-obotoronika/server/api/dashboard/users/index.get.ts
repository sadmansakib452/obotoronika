import { getServerSupabase } from '~~/server/utils/serverSupabase'
import checkUserRole from '~~/server/utils/checkUserRole'
import { usersQuerySchema } from '~~/server/utils/query'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    const query: any = await getValidatedQuery(event, query =>
      usersQuerySchema.safeParse(query),
    )

    const { page, perPage, q, filterBy, sort, order, isMerchants } = query.data

    let supabaseQuery = supabaseAdmin
      .from('extended_users')
      .select('id, email, phone, created_at, last_sign_in_at, user_metadata:raw_user_meta_data', { count: 'exact' })

    if (filterBy) {
      try {
        const query = JSON.parse(filterBy)
        if (query?.status) {
          supabaseQuery = supabaseQuery.eq('raw_user_meta_data->>status', query.status)
        }
        if (query?.role) {
          supabaseQuery = supabaseQuery.eq('raw_user_meta_data->>role', query.role)
        }
      }
      catch (error) {
        console.error('Invalid filterBy JSON:', error)
      }
    }

    if (sort) {
      supabaseQuery = supabaseQuery.order(sort, { ascending: order === 'asc' })
    }

    if (q) {
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${q}%, email.ilike.%${q}%, phone.ilike.%${q}%`,
      )
    }

    if (isMerchants === 'true') {
      supabaseQuery = supabaseQuery
        .in('raw_user_meta_data->>role', ['super_admin', 'admin', 'manager', 'seller'])
        .is('raw_user_meta_data->>merchant_id', null)
    }

    const { data, count, error } = await supabaseQuery.range(
      (page - 1) * perPage,
      page * perPage - 1,
    )

    if (error) throw error

    return successResponse(event, 200, {
      users: data || [],
      nextPage: count && page * perPage < count ? page + 1 : null,
      lastPage: Math.ceil(count ?? 0 / perPage),
      total: count || 0,
    }) as unknown as SuccessResponse<typeof data>
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.log('got error from get all users API.', error)
    return errorResponse(event, 500, error.message)
  }
})
