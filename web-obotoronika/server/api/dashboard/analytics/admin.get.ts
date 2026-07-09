import { getServerSupabase } from '~~/server/utils/serverSupabase'
import supabaseAdmin from '~~/server/utils/supabaseAdmin'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    const { data: countByRole } = await supabaseAdmin.rpc('count_by_role')
    const { data: roleLast7Days } = await supabaseAdmin.rpc('role_counts_last_7_days')

    return successResponse(event, 200, { countByRole, roleLast7Days })
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    return errorResponse(event, 500)
  }
})
