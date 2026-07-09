import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event) => {
  try {
    // Initialize Supabase client
    const supabase = await getServerSupabase(event)

    // Check user role
    const user = await checkUserRole(event, supabase, [
      'admin',
      'customer',
      'super_admin',
      'manager',
      'seller',
    ])

    const { data } = await supabaseAdmin.rpc('count_total_cart_items', { p_user_id: user.id })

    return successResponse(event, 200, { total: data ?? 0 })
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return successResponse(event, 200, { total: 0 })
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error adding product to cart:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
