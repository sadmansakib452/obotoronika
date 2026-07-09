import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)

    const user = await checkUserRole(event, supabase, [
      'admin',
      'customer',
      'super_admin',
      'manager',
      'seller',
    ])

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .select(
        `*, product:products (
      title,
      thumbnail,
      price,
      offer_price,
      slug,
      variants,
      current_stock,
      merchant_id
    )`,
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Got error from fetch wishlist api route', error.message)
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch cart.',
      })
    }

    const products: typeof data = []
    const unavailable: typeof data = []

    for (const item of data) {
      if (item.product.current_stock > 0) {
        products.push(item)
      }
      else {
        unavailable.push(item)
      }
    }

    return successResponse(event, 200, { products, unavailable })
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error adding product to cart:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
