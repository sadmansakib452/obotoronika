import type { H3Event } from 'h3'
import { getServerSupabase } from '~~/server/utils/serverSupabase'
import { userSchema, variantSchema } from '~~/server/database/schema-validator'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await getServerSupabase(event)
    const user = await checkUserRole(supabase, ['super_admin', 'admin'])

    let payload

    try {
      payload = await readValidatedBody(event, body =>
        variantSchema.parse(JSON.parse(body as string)),
      )
    }
    catch (error: any) {
      throw createError({
        status: 400,
        message: error.message,
      })
    }

    const { error, data } = await supabaseAdmin
      .from('options')
      .insert({
        name: payload.name,
        key: payload.key,
        field_type: payload.field_type,
        description: payload.description,
        author_id: user.id,
        author_name: user.user_metadata.name,
      })

    if (error) {
      throw createError({
        message: JSON.stringify(error.message),
        statusCode: 500,
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
    console.error('got error from create variants API route.', error)
    return errorResponse(event, 500, error.message)
  }
})
