import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { wishlistSchema } from '~~/server/database/schema-validator'

export default defineEventHandler(async (event) => {
  try {
    // Initialize Supabase client
    const supabase = await getServerSupabase(event)

    // Check user role
    const user = await checkUserRole(supabase, [
      'super_admin',
      'admin',
      'manager',
    ])

    // Parse and validate the request payload
    const query = getQuery(event)
    const validatedQuery = wishlistSchema.parse(query)

    // Delete the wishlist item
    const { error: deleteError } = await supabaseAdmin
      .from('wishlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', validatedQuery.product_id)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        message: 'Failed to remove product from wishlist',
      })
    }

    return successResponse(
      event,
      200,
      'Product removed from wishlist successfully',
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
