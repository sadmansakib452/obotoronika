import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event) => {
  try {
    // Initialize Supabase client
    const supabase = await getServerSupabase(event)

    const { id } = event.context.params as { id: string }

    // Check user role
    const user = await checkUserRole(event, supabase, [
      'super_admin',
      'admin',
      'manager',
      'customer',
      'seller',
    ])

    // Delete the wishlist item
    const { error: deleteError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', id)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        message: 'Failed to remove product from wishlist',
      })
    }

    return successResponse(
      event,
      200,
      'Product removed from cart successfully.',
    )
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error removing product from wishlist:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
