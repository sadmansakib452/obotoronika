import { z } from 'zod'
import supabaseAdmin from '~~/server/utils/supabaseAdmin'

const querySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'Page must be greater than 0' }),
  perPage: z
    .string()
    .default('10')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, { message: 'PerPage must be greater than 0' }),
  q: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const { slug } = event.context.params as { slug: string }

    const query = getQuery(event)
    const validatedQuery = querySchema.parse(query)

    const { page, perPage, q } = validatedQuery

    // Check if slug belongs to a section
    const { data: section, error: sectionsError } = await supabaseAdmin
      .from('sections')
      .select('id, title, description, slug')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    // Check if slug belongs to a category
    const { data: categoryRaw, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('id, name, description, slug')
      .eq('slug', slug)
      .is('deleted_at', null)
      .eq('is_active', true)
      .single()

    // Transform category to match section structure (name -> title)
    const category = categoryRaw
      ? {
          ...categoryRaw,
          title: categoryRaw.name,
        }
      : null

    // Determine if it's a section or category
    // Note: Supabase .single() returns error when no record found, but we check if data exists
    const isSection = !!section && !sectionsError
    const isCategory = !!category && !categoriesError

    if (!isSection && !isCategory) {
      return errorResponse(event, 404, 'Section or Category not found')
    }

    // Build the base query
    let supabaseQuery = supabaseAdmin
      .from('products')
      .select('id, title, description, price, thumbnail, slug, product_visibility', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)

    // Apply filtering based on section or category
    if (isSection) {
      // Filter by product_visibility for sections
      supabaseQuery = supabaseQuery.or(`product_visibility->>${slug}.eq.true`)
    }
    else if (isCategory && category) {
      // Filter by category_id for categories - ensure ID is a number
      const categoryId = typeof (category as any).id === 'number' ? (category as any).id : Number((category as any).id)
      supabaseQuery = supabaseQuery.eq('category_id', categoryId)
    }

    // Apply search query if provided
    if (q) {
      supabaseQuery = supabaseQuery.ilike('title', `%${q}%`)
    }

    const { data: products, error: productsError, count } = await supabaseQuery

    if (productsError) {
      console.error('Products query error:', productsError)
      throw productsError
    }

    // Use section or category data for response
    const entityData = isSection ? section : category

    const response = {
      ...(entityData as any),
      products,
      meta: {
        total: count || 0,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      },
    }

    return successResponse(event, 200, response)
  }
  catch (error: any) {
    console.error('Error in get section/category with products:', error)
    return errorResponse(event, 500, error?.message)
  }
})
