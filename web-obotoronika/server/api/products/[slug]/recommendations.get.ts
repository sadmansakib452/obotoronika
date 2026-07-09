export default defineEventHandler(async (event) => {
  try {
    // Extract slug from the URL
    const { slug } = event.context.params as { slug: string }

    if (!slug) {
      throw createError({
        statusCode: 400,
        message: 'Slug is required',
      })
    }

    // Call the RPC function to get recommendations
    const { data: recommendations, error } = await supabaseAdmin.rpc('get_recommendations', {
      p_slug: slug,
      p_limit: 10,
    })

    if (error) {
      console.error('Supabase RPC Error:', error)
      throw createError({
        statusCode: 500,
        message: 'Failed to fetch recommendations',
      })
    }

    return {
      recommendations,
    }
  }
  catch (error: any) {
    console.error('Error fetching recommendations:', error)

    // Return a structured error response
    return {
      statusCode: error.statusCode || 500,
      message: JSON.stringify(error),
    }
  }
})
