import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event) => {
  try {
    // Initialize Supabase client
    const supabase = await getServerSupabase(event)
    const { id } = event.context.params as { id: string }

    // Check user role
    const user = await checkUserRole(event, supabase, ['super_admin', 'admin', 'manager', 'customer', 'seller'])

    const body = await readBody(event)

    // Validate payload
    if (!body.quantity || typeof body.quantity !== 'number') {
      return errorResponse(event, 400, 'Invalid quantity provided')
    }

    // Update the cart item quantity
    const { error: updateError } = await supabaseAdmin
      .from('cart_items')
      .update({
        quantity: body.quantity,
      })
      .eq('user_id', user.id)
      .eq('product_id', id)

    if (updateError) {
      throw createError({
        statusCode: 500,
        message: 'Failed to update cart item quantity',
      })
    }

    return successResponse(event, 200, 'Cart item quantity updated successfully')
  }
  catch (error: any) {
    if (error?.statusCode === 401) return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions')) return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error updating cart item quantity:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
