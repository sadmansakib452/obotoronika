import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { addressSchema } from '~~/server/database/schema-validator'

export default defineEventHandler(async (event) => {
  try {
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

    const id = event.context.params?.id || ''

    const body = await readBody(event)

    const { data } = await supabaseAdmin
      .from('addresses')
      .update(body)
      .eq('user_id', user.id)
      .eq('id', id)

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error getting user addresses:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
