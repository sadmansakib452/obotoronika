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
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager', 'seller'])

    const query = getQuery(event)
    const validatedQuery = querySchema.parse(query)
    const { status } = validatedQuery

    let supabaseQuery = supabaseAdmin
      .from('sections')
      .select('*')

    if (status === 'active') {
      supabaseQuery = supabaseQuery.eq('status', 'active')
      supabaseQuery = supabaseQuery.order('active_position', { ascending: true })
    }
    else {
      // Default ordering by creation time
      supabaseQuery = supabaseQuery.order('created_at', { ascending: true })
    }

    const { data, error } = await supabaseQuery

    if (error) throw error

    // Fetch banner counts for each section
    const sectionsWithBannerCount = await Promise.all(
      (data || []).map(async (section: any) => {
        const { count } = await supabaseAdmin
          .from('banners')
          .select('*', { count: 'exact', head: true })
          .eq('section_id', section.id)

        return {
          ...section,
          banner_count: count || 0,
        }
      }),
    )

    return successResponse(event, 200, {
      sections: sectionsWithBannerCount,
    }) as unknown as SuccessResponse<typeof sectionsWithBannerCount>
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('Error in get sections:', error)
    return errorResponse(event, 500, error.message)
  }
})
