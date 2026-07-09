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

    const { data: addresses } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    // Parse and validate the request payload
    const body = await readBody(event)
    const payload: any = {
      ...addressSchema.parse(body),
      user_id: user.id, // Add user_id explicitly
    }

    if (!addresses?.length) {
      payload.is_default = true
      payload.is_billing = true
    }

    const { data } = await supabaseAdmin
      .from('addresses')
      .insert(payload)
      .eq('user_id', user.id)
      .select('*')

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error adding user addresses:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
