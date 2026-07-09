import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    const categoryID = event.context.params?.id

    await supabaseAdmin.rpc('undo_delete_category', {
      p_id: categoryID,
    })

    return successResponse(
      event,
      200,
      'Undo successful. Category restoration completed.',
    ) as SuccessResponse<any>
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.log('get error from undo category', error)
    return errorResponse(event, 500)
  }
})
