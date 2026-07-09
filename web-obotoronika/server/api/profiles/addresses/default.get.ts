import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

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

    // First, check for `is_saved`
    let { data: savedAddress } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('is_saved', true)
      .eq('user_id', user.id)
      .single()

    // If no `is_saved` address is found, check for `is_default`
    if (!savedAddress) {
      const { data: defaultAddress } = await supabaseAdmin
        .from('addresses')
        .select('*')
        .eq('is_default', true)
        .eq('user_id', user.id)
        .single()

      savedAddress = defaultAddress // Fallback to default address
    }

    return successResponse(event, 200, savedAddress)
  }
  catch (error: any) {
    if (error?.message?.includes('permissions')) {
      return errorResponse(event, 403, 'Permission denied')
    }
    if (error?.errors) {
      return errorResponse(event, 400, error.errors)
    }
    console.error('Error getting default address:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
