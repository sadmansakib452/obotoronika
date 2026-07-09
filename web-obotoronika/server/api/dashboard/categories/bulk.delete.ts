import type { H3Event } from 'h3'
import { z } from 'zod'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

const querySchema = z.object({
  categories: z
    .string({ required_error: 'Category IDs are required.' })
    .refine(val => /^(\d+,)*\d+$/.test(val), {
      message:
        'Please provide a valid list of category IDs, separated by commas.',
    }),
})

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    const query = await getValidatedQuery(event, query =>
      querySchema.safeParse(query),
    )

    if (query.error) {
      throw createError({
        statusCode: 400,
        message: query.error.message,
      })
    }

    const ids = query.data.categories.split(',').map(Number)

    const { data, error } = await supabaseAdmin.rpc('bulk_delete_categories', {
      p_ids: ids,
    })

    if (error) {
      throw createError({
        statusCode: 500,
        cause: error.cause,
        message: error.message,
      })
    }

    const thumbnails = data?.map((category: any) => category.thumbnail)

    for (const thumbnail of thumbnails) {
      await hubBlob().del(`images/categories/${thumbnail}`)
    }

    return successResponse(event, 200, 'Categories deleted successfully.')
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    console.log('get error from bulk delete category', error)
    return errorResponse(event, 500)
  }
})
