export default defineEventHandler(async (event) => {
  try {
    const { slug } = event.context.params as { slug: string }

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (!data) {
      return errorResponse(event, 404, 'Product not found')
    }

    if (error) {
      throw createError({
        message: error.message,
        statusCode: 500,
      })
    }

    return successResponse(event, 200, data)
  }
  catch (error: any) {
    console.error('Error fetching product:', error)
    return errorResponse(event, 500, error?.message)
  }
})
