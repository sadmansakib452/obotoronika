import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    const merchantID = event.context.params?.id

    await supabaseAdmin.rpc('undo_delete_merchant', {
      p_id: merchantID,
    })

    return successResponse(
      event,
      200,
      'Undo successful. Merchant restoration completed.',
    )
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.log('get error from undo merchant', error)
    return errorResponse(event, 500)
  }
})
