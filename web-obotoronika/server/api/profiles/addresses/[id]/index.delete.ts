import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event) => {
  try {
    // Initialize Supabase client
    const supabase = await getServerSupabase(event)

    // Check user role
    const user = await checkUserRole(supabase, [
      'admin',
      'customer',
      'super_admin',
      'manager',
      'seller',
    ])

    const id = event.context.params?.id || ''

    const { data } = await supabaseAdmin
      .from('addresses')
      .delete()
      .eq('user_id', user.id)
      .eq('id', id)

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error getting user addresses:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
