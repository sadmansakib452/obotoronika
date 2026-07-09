import { z } from 'zod'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import checkUserRole from '~~/server/utils/checkUserRole'

const querySchema = z.object({
  status: z
    .string()
    .optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    const query = getQuery(event)
    const validatedQuery = querySchema.parse(query)
    const { status } = validatedQuery

    let supabaseQuery = supabaseAdmin
      .from('banners')
      .select(`
        *,
        sections:section_id (
          id,
          title,
          slug,
          description
        )
      `)

    if (status) {
      supabaseQuery = supabaseQuery.eq('status', status)
    }

    supabaseQuery = supabaseQuery.order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    const { data, error } = await supabaseQuery

    if (error) throw error

    return successResponse(event, 200, {
      banners: data || [],
    })
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('Error in get banners:', error)
    return errorResponse(event, 500, error.message)
  }
})
