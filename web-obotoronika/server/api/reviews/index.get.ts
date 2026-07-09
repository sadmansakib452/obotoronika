import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    const { id } = await checkUserRole(supabase, [
      'admin',
      'customer',
      'manager',
      'seller',
      'super_admin',
    ])

    const { data, error } = await supabaseAdmin
      .from('user_review_details')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.log('=====rr===============================')
      console.log(error)
      console.log('====================================')
      return successResponse(event, 200, [])
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
