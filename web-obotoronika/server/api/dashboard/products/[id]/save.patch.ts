import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { productSchema } from '~~/server/database/schema-validator'
import supabaseAdmin from '~~/server/utils/supabaseAdmin'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, [
      'super_admin',
      'admin',
      'manager',
      'seller',
    ])

    const productID = event.context.params?.id || ''

    // For manager/seller, verify product ownership
    // @ts-ignore
    if (['manager', 'seller'].includes(user?.role)) {
      if (!user.user_metadata.merchant_id) {
        throw createError({
          statusCode: 404,
          message:
            'Merchant not found. Please create a merchant before adding a product.',
        })
      }
      if (user.user_metadata.merchant_status !== 'active') {
        throw createError({
          statusCode: 403,
          message: 'Merchant is not active',
        })
      }

      const { data: product } = await supabaseAdmin
        .from('products')
        .select('id, merchant_id')
        .eq('id', productID)
        .eq('merchant_id', user.user_metadata.merchant_id)
        .single()

      if (!product || product.merchant_id !== user.user_metadata.merchant_id || product.id !== productID) {
        throw createError({
          message: 'Unauthorized: You can only update your own products',
          statusCode: 403,
        })
      }
    }

    let payload

    const body: any = await readValidatedBody(event, body => body)

    try {
      payload = productSchema.parse({
        ...body,
        status: 'draft',
      })
    }
    catch (error: any) {
      throw createError({
        status: 400,
        message: error.message,
      })
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(payload)
      .eq('id', productID)
      .select('*')

    if (error) {
      throw createError({
        cause: error.message,
        message: 'Error updating product',
      })
    }
    if (!data?.length) {
      throw createError({
        message: 'Product not found',
        statusCode: 404,
      })
    }

    return successResponse(event, 200, data[0])
  }
  catch (error: any) {
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (!error?.statusCode) {
      console.error('got error from update product by ID.', error)
    }
    return errorResponse(event, error?.statusCode || 500, error.message)
  }
})
