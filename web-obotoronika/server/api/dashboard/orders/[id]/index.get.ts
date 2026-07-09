import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, ['super_admin', 'admin', 'manager', 'seller'])

    const order_id = event.context.params?.id

    const { data, error } = await supabaseAdmin
      .rpc('get_merchant_order_details', {
        p_order_id: order_id || '',
        p_merchant_id: user.user_metadata.merchant_id || '',
      })

    if (error) throw new Error(error.message)

    return successResponse(event, 200, {
      order: data,
    })
  }
  catch (error: any) {
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('got error from get all merchants API.', error)
    return errorResponse(event, error?.statusCode || 500, error.message)
  }
})
