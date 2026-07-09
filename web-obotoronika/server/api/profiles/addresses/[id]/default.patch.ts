import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { defaultAddressQuerySchema } from '~~/server/utils/query'

export default defineEventHandler(async (event) => {
  try {
    // Initialize Supabase client
    const supabase = await getServerSupabase(event)
    const query = getQuery(event)
    const validatedQuery = defaultAddressQuerySchema.parse(query)
    const { is_billing, is_default: _is_default } = validatedQuery

    const payload1: any = {}
    const payload2: any = {}

    if (is_billing) {
      payload1.is_billing = false
      payload2.is_billing = true
    }
    else {
      payload1.is_default = false
      payload2.is_default = true
    }

    // Check user role
    const user = await checkUserRole(supabase, [
      'admin',
      'customer',
      'super_admin',
      'manager',
      'seller',
    ])

    const id = event.context.params?.id || ''

    // Validate the ID
    if (!id) {
      return errorResponse(event, 400, 'Address ID is required.')
    }

    // Set `is_default` to FALSE for all addresses of the user
    await supabaseAdmin
      .from('addresses')
      .update(payload1)
      .eq('user_id', user.id)

    // Set `is_default` to TRUE for the selected address
    const { data, error } = await supabaseAdmin
      .from('addresses')
      .update(payload2)
      .eq('user_id', user.id)
      .eq('id', id)
      .select('*')

    if (error) {
      console.error('Error updating default address:', error.message)
      return errorResponse(event, 500, 'Failed to update default address.')
    }

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    if (error?.message?.includes('permissions')) {
      return errorResponse(event, 403, 'Permission denied')
    }
    if (error?.errors) {
      return errorResponse(event, 400, error.errors)
    }
    console.error('Error updating default address:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
