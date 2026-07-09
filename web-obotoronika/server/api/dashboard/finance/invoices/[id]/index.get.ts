import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    const id = event.context.params?.id

    await checkUserRole(supabase, ['super_admin', 'admin', 'manager', 'seller'])

    const { data, error } = await supabaseAdmin
      .rpc('get_invoice_details_by_id', { p_invoice_id: id })

    if (error) throw new Error(error.message)

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')

    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')

    console.error('Error fetching transaction details:', error)
    return errorResponse(event, 500, error.message)
  }
})
