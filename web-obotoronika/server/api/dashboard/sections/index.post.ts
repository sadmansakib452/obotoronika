import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { sectionsSchema } from '~~/server/database/schema-validator'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    await checkUserRole(supabase, ['super_admin', 'admin', 'manager'])

    const body: any = await readValidatedBody(event, body => body)

    let payload

    try {
      payload = sectionsSchema.parse(body)
    }
    catch (error: any) {
      throw createError({
        status: 400,
        message: error.message,
      })
    }

    const { data, error } = await supabaseAdmin
      .from('sections')
      .insert(payload)
      .select('*')

    if (error) {
      throw createError({
        message: JSON.stringify(error.message),
        statusCode: 400,
      })
    }

    return successResponse(event, 201, data)
  }
  catch (error: any) {
    if (error?.statusCode === 401)
      return errorResponse(event, 401, 'Unauthorized')
    if (error?.statusCode === 400)
      return errorResponse(event, 400, JSON.parse(error.message))
    if (error?.message?.includes('permissions'))
      return errorResponse(event, 403, 'Permission denied')
    console.error('Error in section creation:', error)
    return errorResponse(event, 500, error.message)
  }
})
