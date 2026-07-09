import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { cartSchema } from '~~/server/database/schema-validator'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getServerSupabase(event)

    // Check user role
    const user = await checkUserRole(event, supabase, ['super_admin', 'admin', 'manager', 'customer'])

    // Parse and validate body
    const body = await readBody(event)
    const payload = cartSchema.parse(body)

    const { product_id, quantity, variants } = payload

    // Check if this exact product+variants combo exists
    const { data: existingCartItem, error: fetchError } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .eq('variants', JSON.stringify(variants))
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch cart item',
      })
    }

    if (existingCartItem) {
      // If already exists, update quantity
      const { error: updateError } = await supabaseAdmin
        .from('cart_items')
        .update({
          quantity: existingCartItem.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('product_id', product_id)
        .eq('variants', JSON.stringify(variants)) // will work if variant keys are always in the same order

      if (updateError) {
        throw createError({
          statusCode: 500,
          message: 'Failed to update cart item quantity',
        })
      }

      return successResponse(event, 200, 'Cart item quantity updated successfully')
    }

    // Insert new item if not found
    const { error: insertError } = await supabaseAdmin
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id,
        quantity,
        variants, // can be inserted as-is if JSON object
      })

    if (insertError) {
      throw createError({
        statusCode: 500,
        message: 'Failed to insert cart item',
      })
    }

    return successResponse(event, 201, 'Product added to cart successfully')
  }
  catch (error: any) {
    if (error?.statusCode === 401) return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions')) return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error adding product to cart:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
