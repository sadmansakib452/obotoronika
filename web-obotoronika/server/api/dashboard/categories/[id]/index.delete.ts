import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin'])

    const categoryID = event.context.params?.id

    const { data, error } = await supabaseAdmin.rpc('soft_delete_category', {
      p_id: categoryID,
    })

    if (error) {
      throw createError({
        statusCode: 500,
        cause: error.cause,
        message: error.message,
      })
    }
    const config = useRuntimeConfig()

    await fetch(`${config.public.mediaUrl}/api/media?path=${data?.[0].thumbnail}`, {
      method: 'DELETE',
    })

    return successResponse(
      event,
      200,
      'Category deleted successfully.',
    ) as SuccessResponse<any>
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.log('get error from delete category', error)
    return errorResponse(event, 500)
  }
})
