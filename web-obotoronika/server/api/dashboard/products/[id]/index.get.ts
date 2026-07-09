import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, [
      'super_admin',
      'admin',
      'manager',
      'seller',
    ])

    const productID = event.context.params?.id || ''

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productID)
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        message: error.message,
      })
    }

    if (!data) {
      throw createError({
        statusCode: 404,
        message: 'Product not found',
      })
    }

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (!error?.statusCode) {
      console.error('got error from get product by ID.', error)
    }
    return errorResponse(event, error?.statusCode || 500, error.message)
  }
})
