import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager', 'seller'])

    const variant_id = event.context.params?.id

    const { data, error } = await supabaseAdmin
      .from('options')
      .select('id, name, field_type, values:option_values(*)')
      .eq('id', variant_id)
      .single()

    if (error) {
      throw createError({
        message: JSON.stringify(error.message),
        statusCode: 500,
      })
    }

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('got error from create variants API route.', error)
    return errorResponse(event, 500, error.message)
  }
})
