import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)

    const user = await checkUserRole(supabase, [
      'super_admin',
      'admin',
      'customer',
    ])

    // Perform count queries
    const [processingRes, deliveredRes] = await Promise.all([
      supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'processing'),
      supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'delivered'),
    ])

    return successResponse(event, 200, {
      counts: {
        processing: processingRes.count || 0,
        delivered: deliveredRes.count || 0,
      },
    })
  }
  catch (error: any) {
    // Full error logging
    console.error('💥 Full Error:', JSON.stringify(error, null, 2))

    return errorResponse(
      event,
      error?.statusCode || 500,
      error?.message || 'Unexpected error occurred',
    )
  }
})
