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

    const { count } = await supabaseAdmin
      .from('wishlist_items')
      .select('', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return successResponse(event, 200, { total: count })
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return successResponse(event, 200, { total: 0 })
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error getting wishlist count:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
