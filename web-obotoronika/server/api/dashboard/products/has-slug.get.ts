import { z } from 'zod'

const querySchema = z.object({
  slug: z.string({ required_error: 'Slug is required' }),
})

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, query =>
      querySchema.safeParse(query),
    )
    const slug = query.data?.slug.trim()

    if (query.error) {
      return errorResponse(event, 400, query.error.issues[0].message)
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('slug', slug)

    if (error) {
      return errorResponse(event, 500, error.message)
    }

    if (!data || data.length === 0) {
      // No rows returned
      return successResponse(event, 200, { hasSlug: false })
    }

    if (data.length > 1) {
      // Multiple rows returned
      console.warn(`Multiple rows found for slug: ${slug}`)
      return successResponse(event, 200, {
        hasSlug: true,
        ids: data.map(row => row.id), // Return all matching IDs
      })
    }

    // Single row returned
    return successResponse(event, 200, {
      hasSlug: true,
      id: data[0].id,
    })
  }
  catch (error: any) {
    console.error('Error in has-slug API:', error)
    return errorResponse(event, 500, error?.message)
  }
})
