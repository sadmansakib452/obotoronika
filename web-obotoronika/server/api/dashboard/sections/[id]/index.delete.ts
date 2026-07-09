import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager', 'seller'])

    const id = event.context.params?.id || ''

    const { error } = await supabaseAdmin
      .from('sections')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: 500,
        message: error.message,
      })
    }

    return successResponse(event, 200, 'Section deleted successfully')
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
