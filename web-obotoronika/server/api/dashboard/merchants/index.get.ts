import { z } from 'zod'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

const querySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform(val => parseInt(val, 10))
    .nullable(),
  perPage: z
    .string()
    .default('10')
    .transform(val => parseInt(val, 10))
    .nullable(),
  q: z.string().optional(),
  filterBy: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
})

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    const query: any = await getValidatedQuery(event, query =>
      querySchema.safeParse(query),
    )

    const { page, perPage, q, filterBy, sort, order } = query.data

    let supabaseQuery = supabaseAdmin
      .from('merchants')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)

    if (filterBy) {
      try {
        const query = JSON.parse(filterBy)
        if (query?.status) {
          supabaseQuery = supabaseQuery.eq('status', query.status)
        }
      }
      catch (error) {
        console.error('Invalid filterBy JSON:', error)
      }
    }

    if (q) {
      const searchableFields = ['name', 'website', 'address']
      const searchQuery = searchableFields
        .map(field => `${field}.ilike.%${q}%`)
        .join(',')

      supabaseQuery = supabaseQuery.or(searchQuery)
    }

    if (sort) {
      supabaseQuery = supabaseQuery.order(sort, { ascending: order === 'asc' })
    }

    const { data, count, error } = await supabaseQuery.range(
      (page - 1) * perPage,
      page * perPage - 1,
    )

    if (error) {
      return createError({
        message: error.message,
        statusCode: 500,
      })
    }

    return successResponse(event, 200, {
      merchants: data,
      paginate: {
        nextPage: count && page * perPage < count ? page + 1 : null,
        lastPage: Math.ceil(count ?? 0 / perPage),
        total: count || 0,
      },
    })
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.log('got error from get all merchants API.', error)
    return errorResponse(event, 500, error.message)
  }
})
