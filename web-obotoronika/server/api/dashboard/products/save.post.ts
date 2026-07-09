import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { productSchema } from '~~/server/database/schema-validator'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, [
      'super_admin',
      'admin',
      'manager',
    ])

    const body: any = await readValidatedBody(event, body => body)

    let payload

    const userID = user.id || ''

    const { data, error: merchantError } = await supabaseAdmin
      .from('merchants')
      .select('id')
      .eq('user_id', userID)
      .single()

    if (merchantError?.message || merchantError?.code || !data?.id) {
      throw createError({
        status: 404,
        message:
          'Merchant not found. Please create a merchant before adding a product.',
      })
    }

    try {
      payload = productSchema.parse({
        ...body,
        merchant_id: data?.id,
        status: 'draft',
      })
    }
    catch (error: any) {
      throw createError({
        status: 400,
        message: error.message,
      })
    }

    const { error } = await supabaseAdmin.from('products').insert(payload)

    if (error) {
      throw createError({
        statusCode: 400,
        message: JSON.stringify(error.message),
      })
    }

    return successResponse(
      event,
      201,
      'Product has been successfully saved as a draft.',
    )
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
