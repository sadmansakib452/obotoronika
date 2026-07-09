import { z } from 'zod'
import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

const deleteManySchema = z.object({
  product_ids: z.array(z.string()).min(1, 'At least one product ID is required'),
})

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getServerSupabase(event)

    const user = await checkUserRole(event, supabase, [
      'super_admin',
      'admin',
      'manager',
      'customer',
      'seller',
    ])

    const body = await readBody(event)
    const { product_ids } = deleteManySchema.parse(body)

    const { error: deleteError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .in('product_id', product_ids)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        message: 'Failed to remove products from cart',
      })
    }

    return successResponse(
      event,
      200,
      { deleted: product_ids.length },
      'Products removed from cart successfully.',
    )
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error removing products from cart:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
