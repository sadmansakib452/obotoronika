import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, [
      'admin',
      'customer',
      'manager',
      'seller',
      'super_admin',
    ])
    const id = event.context.params?.id
    const product_id = event.context.params?.product_id

    const { data, error } = await supabaseAdmin
      .from('order_items')
      .select('*, product:products(title, thumbnail)')
      .eq('id', id)
      .eq('product_id', product_id)
      .single()

    if (error) {
      return errorResponse(event, 404, 'Order Item not found.')
    }

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('get error from update category ->', error)
    return errorResponse(event, 500)
  }
})
