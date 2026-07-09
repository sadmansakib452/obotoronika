import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager', 'seller'])

    const productID = event.context.params?.id || ''

    const { data, error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productID)
      .select('thumbnail, files')

    if (error) {
      throw createError({
        statusCode: 500,
        message: error.message,
      })
    }

    if (data) {
      const { thumbnail, files } = data[0]

      if (thumbnail) {
        await hubBlob().delete(`images/products/${thumbnail}`)
      }

      if (files && Array.isArray(files)) {
        for (const file of files) {
          await hubBlob().delete(`images/products/${file}`)
        }
      }
    }

    return successResponse(event, 200, {
      message: 'Product deleted successfully',
    })
  }
  catch (error: any) {
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (!error?.statusCode) {
      console.error('got error from delete product by ID.', error)
    }
    return errorResponse(event, error?.statusCode || 500, error.message)
  }
})
