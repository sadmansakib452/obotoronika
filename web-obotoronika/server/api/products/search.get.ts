import type { H3Event } from 'h3'
import { z } from 'zod'
import supabaseAdmin from '~~/server/utils/supabaseAdmin'

const querySchema = z.object({
  q: z.string().optional().default(''),
  limit: z
    .string()
    .optional()
    .default('8')
    .transform(val => Math.min(parseInt(val, 10) || 8, 20)),
})

export default defineEventHandler(async (event: H3Event) => {
  try {
    const query = getQuery(event)
    const { q, limit } = querySchema.parse(query)

    if (!q?.trim()) {
      return successResponse(event, 200, { products: [] })
    }

    const searchTerm = `%${q.trim()}%`

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, title, slug, thumbnail')
      .eq('status', 'published')
      .ilike('title', searchTerm)
      .order('title')
      .limit(limit)

    if (error) {
      throw createError({
        statusCode: 500,
        message: error.message,
      })
    }

    return successResponse(event, 200, { products: data ?? [] })
  }
  catch (error: any) {
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    console.error('Search API error:', error)
    return errorResponse(event, error?.statusCode || 500, error?.message)
  }
})
