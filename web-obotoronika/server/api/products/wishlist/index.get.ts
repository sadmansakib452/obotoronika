import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event) => {
  try {
    // Initialize Supabase client
    const supabase = await getServerSupabase(event)

    // Check user role (include customer so they can load their wishlist for product card hearts)
    const user = await checkUserRole(supabase, [
      'super_admin',
      'admin',
      'manager',
      'customer',
    ])

    // Check if the product is already in the user's wishlist
    const { data, error } = await supabaseAdmin
      .from('wishlist_items')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Got error from fetch wishlist api route', error.message)
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch wishlists',
      })
    }

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    if (error?.statusCode === 401) return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions')) return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error getting wishlist items:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
