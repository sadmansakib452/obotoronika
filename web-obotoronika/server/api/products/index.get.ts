import type { H3Event } from 'h3'
import { z } from 'zod'

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
  filterBy: z.string().optional(),
  sort: z.string().optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export default defineEventHandler(async (event: H3Event) => {
  try {
    const query = getQuery(event)
    const validatedQuery = querySchema.parse(query)

    const { page, perPage, q, filterBy, sort, order } = validatedQuery

    let supabaseQuery = supabaseAdmin
      .from('products')
      .select('title, description, price, thumbnail, availability, offer_price', {
        count: 'exact',
      })
      .eq('status', 'published')

    if (q) {
      supabaseQuery = supabaseQuery.ilike('name', `%${q}%`)
    }

    if (filterBy) {
      supabaseQuery = supabaseQuery.eq(filterBy, true)
    }

    supabaseQuery = supabaseQuery
      .order(sort, { ascending: order === 'asc' })
      .range((page - 1) * perPage, page * perPage - 1)

    // Execute the query
    const { data, error, count } = await supabaseQuery

    if (error) {
      throw createError({
        statusCode: 500,
        message: error.message,
      })
    }

    return successResponse(event, 200, {
      products: data,
      meta: {
        total: count || 0,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage),
      },
    })
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
