import type { H3Event } from 'h3'
import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import checkUserRole from '~~/server/utils/checkUserRole'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    const userId = getRouterParam(event, 'id')
    if (!userId) {
      return errorResponse(event, 400, 'User ID is required')
    }

    const { data, error } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return errorResponse(event, 500, error.message)
    }

    return successResponse(event, 200, data || [])
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('[admin addresses] Error:', error)
    return errorResponse(event, 500, 'Failed to fetch addresses')
  }
})
