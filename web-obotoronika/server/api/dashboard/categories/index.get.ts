import type { H3Event } from 'h3'
import { z } from 'zod'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

const querySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'Page must be greater than 0' }),
  perPage: z
    .string()
    .default('10')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'PerPage must be greater than 0' }),
})

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager', 'seller'])

    const query = getQuery(event)
    const validatedQuery = querySchema.parse(query)
    const { page, perPage } = validatedQuery

    // Get total count first
    const { count, error: countError } = await supabaseAdmin
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    if (countError) {
      throw createError({
        statusCode: 500,
        message: 'Internal Server Error',
        data: { error: 'Internal Server Error' },
      })
    }

    // Fetch paginated categories with product count
    const { data, error } = await supabaseAdmin.rpc(
      'get_categories_with_product_count',
    )

    if (error) {
      throw createError({
        statusCode: 500,
        message: 'Internal Server Error',
        data: { error: 'Internal Server Error' },
      })
    }

    // Apply pagination manually since RPC doesn't support it
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedData = data?.slice(startIndex, endIndex) || []

    return successResponse(event, 200, {
      categories: paginatedData,
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
    console.error('got error from get categories API.', error)
    return errorResponse(event, error?.statusCode || 500, error.message)
  }
})
