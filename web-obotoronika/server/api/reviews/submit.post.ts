import supabaseAdmin from '@@/server/utils/supabaseAdmin'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { ratingSchema } from '~~/server/database/schema-validator'

export default defineEventHandler(async (event) => {
  try {
    // Initialize Supabase client
    const supabase = await getServerSupabase(event)

    // Check user role
    const user = await checkUserRole(supabase, [
      'admin',
      'customer',
      'super_admin',
      'manager',
      'seller',
    ])

    const rawBody = await readBody(event)

    try {
      const body = ratingSchema.parse(rawBody)
      const payload = {
        ...body,
        user_id: user.id,
      }

      const { error } = await supabaseAdmin
        .from('reviews')
        .insert(payload)

      if (error) {
        throw createError({ statusCode: 500, message: 'Failed to create review.' })
      }

      return successResponse(event, 201, 'Review Created.')
    }
    catch (error: any) {
      return errorResponse(event, 400, error.flatten().fieldErrors)
    }
  }
  catch (error: any) {
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    if (error?.errors) return errorResponse(event, 400, error.errors)
    console.error('Error creating review:', error)
    return errorResponse(event, 500, 'Internal Server Error')
  }
})
