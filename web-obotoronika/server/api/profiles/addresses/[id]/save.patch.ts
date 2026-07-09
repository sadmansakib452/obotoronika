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

    const id = event.context.params?.id || ''

    // Validate the ID
    if (!id) {
      return errorResponse(event, 400, 'Address ID is required.')
    }

    // Set `is_default` to FALSE for all addresses of the user
    await supabaseAdmin
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)

    // Set `is_default` to TRUE for the selected address
    const { data, error } = await supabaseAdmin
      .from('addresses')
      .update({ is_default: true })
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
