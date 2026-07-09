import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { wishlistSchema } from '~~/server/database/schema-validator'

export default defineEventHandler(async (event) => {
  try {
    // Initialize Supabase client
    const supabase = await getServerSupabase(event)

    // Check user role
    const user = await checkUserRole(supabase, [
      'customer',
      'seller',
      'super_admin',
      'admin',
      'manager',
    ])

    // Parse and validate the request payload
    const body = await readBody(event)
    const payload = wishlistSchema.parse(body)

    // Check if the product is already in the user's wishlist
    const { data: existingItem, error: existingError } = await supabaseAdmin
      .from('wishlist_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', payload.product_id)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      throw createError({
        statusCode: 500,
        message: 'Internal Server Error',
      })
    }

    if (existingItem) {
      return errorResponse(event, 400, 'Product is already in the wishlist')
    }

    // Insert the wishlist item
    const { error: insertError } = await supabaseAdmin.from('wishlist_items').insert({
      user_id: user.id,
      product_id: payload.product_id,
    })

    if (insertError) {
      throw createError({
        statusCode: 500,
        message: 'Failed to add product to wishlist',
      })
    }

    return successResponse(event, 201, 'Product added to wishlist successfully') as SuccessResponse<string>
  }
  catch (error: any) {
    if (error?.statusCode === 401) return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions')) return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error adding product to wishlist:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
