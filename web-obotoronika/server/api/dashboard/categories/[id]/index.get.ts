import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['admin', 'super_admin'])
    const categoryID = event.context.params?.id

    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', categoryID)
      .single()

    if (error) {
      return errorResponse(event, 404, 'Category not found.')
    }

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('get error from update category ->', error)
    return errorResponse(event, 500)
  }
})
