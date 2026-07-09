import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { wishlistQuerySchema } from '@@/server/utils/query'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const validatedQuery = wishlistQuerySchema.parse(query)

    const { page, perPage } = validatedQuery

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

    // Check if the product is already in the user's wishlist
    let supabaseQuery = supabaseAdmin
      .from('wishlist_items')
      .select(
        `
    *,
    product:products (
      id,
      title,
      thumbnail,
      price,
      offer_price,
      slug
    )
  `,
        { count: 'exact' },
      )
      .eq('user_id', user.id)

    supabaseQuery = supabaseQuery.range(
      (page - 1) * perPage,
      page * perPage - 1,
    )

    const { data, error, count } = await supabaseQuery

    if (error) {
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch wishlists',
      })
    }

    return successResponse(event, 200, {
      products: data,
      meta: {
        total: count || 0,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      },
    })
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error getting wishlist items:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
