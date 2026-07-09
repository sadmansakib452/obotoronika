import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { checkoutQuery } from '~~/server/utils/query'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await getServerSupabase(event)

    // Check user role
    const user = await checkUserRole(supabase, [
      'super_admin',
      'admin',
      'manager',
      'customer',
    ])

    // Parse the request body
    const body = await readBody(event)
    const { order_id, payment_info, payment_method } = checkoutQuery.parse(body)

    const payload = {
      payment_method,
      payment_info: JSON.parse(payment_info),
    }

    // Update the order in the orders table
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(payload)
      .eq('order_id', order_id)
      .select('*')
      .single()

    if (error) {
      console.error('Error during checkout:', error.message)
      throw createError({
        statusCode: 500,
        message: 'Failed to checkout.',
      })
    }

    // Return the updated order data
    return successResponse(event, 200, {
      message: 'Checkout successful.',
      data,
    })
  }
  catch (error: any) {
    if (error?.statusCode === 400) {
      return errorResponse(event, 400, error.message)
    }
    if (error?.statusCode === 401) {
      return errorResponse(event, 401, 'Unauthorized')
    }
    if (error?.message?.includes('permissions')) {
      return errorResponse(event, 403, 'Permission denied')
    }
    if (error?.errors) {
      return errorResponse(event, 400, error.errors)
    }
    console.error('Error during checkout:', error.message)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
